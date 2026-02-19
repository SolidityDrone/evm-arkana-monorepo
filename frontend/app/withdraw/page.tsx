'use client';

import React, { useState } from 'react';
import { useWithdraw } from '@/hooks/useWithdraw';
import { useAaveTokens } from '@/hooks/useAaveTokens';
import { useAccountSigning } from '@/hooks/useAccountSigning';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SpellButton } from '@/components/spell-button';
import TransactionModal from '@/components/TransactionModal';
import { useToast } from '@/components/Toast';
import { TokenIcon } from '@/lib/token-icons';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from '@/lib/abi/ArkanaConst';
import { encodeFunctionData } from 'viem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ARKANA_MESSAGE } from '@/lib/zk-address';
import { ProofParamsConfirmModal } from '@/components/ProofParamsConfirmModal';

export default function WithdrawPage() {
    const { toast } = useToast();
    const {
        zkAddress,
        tokenAddress,
        setTokenAddress,
        tokenDecimals,
        amount,
        setAmount,
        receiverAddress,
        setReceiverAddress,
        receiverFeeAmount,
        setReceiverFeeAmount,
        arbitraryCalldata,
        setArbitraryCalldata,
        arbitraryCalldataHash,
        tokenName,
        tokenSymbol,
        isProving,
        proof,
        proofError,
        provingTime,
        currentProvingTime,
        publicInputs,
        isSubmitting,
        isSimulating,
        simulationResult,
        txHash,
        txError,
        isPending,
        isConfirming,
        isConfirmed,
        tokenCurrentNonce,
        isTokenInitialized,
        isCheckingTokenState,
        availableBalance,
        availableBalanceAssets,
        isCalculatingInputs,
        canAbsorb,
        groth16Result,
        withdrawCircuit,
        proveWithdraw,
        handleWithdraw,
    } = useWithdraw();

    const { handleSign, isSigning } = useAccountSigning();
    const { tokens: aaveTokens, isLoading: isLoadingTokens } = useAaveTokens();
    const [showTokenSelector, setShowTokenSelector] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [isRelayerSubmitting, setIsRelayerSubmitting] = useState(false);
    const [relayerTxHash, setRelayerTxHash] = useState<string | null>(null);
    const [relayerError, setRelayerError] = useState<string | null>(null);
    const [isCustomSpell, setIsCustomSpell] = useState(false);
    const [showSignDataModal, setShowSignDataModal] = useState(false);
    const [showProofConfirmModal, setShowProofConfirmModal] = useState(false);

    React.useEffect(() => {
        if (isProving || isPending || isConfirming || isConfirmed) {
            setShowTransactionModal(true);
        }
    }, [isProving, isPending, isConfirming, isConfirmed]);

    React.useEffect(() => {
        if (isConfirmed && txHash) {
            toast('WITHDRAW TRANSACTION CONFIRMED', 'success');
        }
    }, [isConfirmed, txHash, toast]);

    React.useEffect(() => {
        if (txError) setShowTransactionModal(true);
    }, [txError]);

    const formatBalance = (balance: bigint | null, decimals: number | null): string => {
        if (balance === null || decimals === null) return '0';
        const divisor = BigInt(10 ** decimals);
        const integerPart = balance / divisor;
        const decimalPart = balance % divisor;
        const decimalStr = decimalPart.toString().padStart(decimals, '0');
        const decimalStrTrimmed = decimalStr.replace(/0+$/, '');
        return decimalStrTrimmed === '' ? integerPart.toString() : `${integerPart.toString()}.${decimalStrTrimmed}`;
    };

    const handleWithdrawViaRelayer = React.useCallback(async () => {
        if (!groth16Result?.publicSignals || groth16Result.publicSignals.length < 15) {
            setRelayerError('Proof and public inputs required');
            return;
        }
        try {
            setIsRelayerSubmitting(true);
            setRelayerError(null);
            setRelayerTxHash(null);
            setShowTransactionModal(true);
            const pA: [bigint, bigint] = [BigInt(groth16Result.pA[0]), BigInt(groth16Result.pA[1])];
            const pB: [[bigint, bigint], [bigint, bigint]] = [
                [BigInt(groth16Result.pB[0][0]), BigInt(groth16Result.pB[0][1])],
                [BigInt(groth16Result.pB[1][0]), BigInt(groth16Result.pB[1][1])],
            ];
            const pC: [bigint, bigint] = [BigInt(groth16Result.pC[0]), BigInt(groth16Result.pC[1])];
            const publicSignals = groth16Result.publicSignals.slice(0, 15).map((s: string) => BigInt(s)) as [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
            const callDataBytes: `0x${string}` = arbitraryCalldata?.trim() ? (arbitraryCalldata.startsWith('0x') ? arbitraryCalldata : `0x${arbitraryCalldata}`) as `0x${string}` : '0x';
            const calldata = encodeFunctionData({
                abi: ArkanaAbi,
                functionName: withdrawCircuit === 'absorb_withdraw' ? 'absorbWithdraw' : 'withdraw',
                args: [pA, pB, pC, publicSignals, callDataBytes],
            });
            const response = await fetch('/api/relayer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: ArkanaAddress, data: calldata, gasLimit: '3000000' }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || 'Relayer request failed');
            setRelayerTxHash(result.hash);
            toast('WITHDRAW TRANSACTION CONFIRMED (VIA RELAYER)', 'success');
        } catch (e) {
            setRelayerError(e instanceof Error ? e.message : 'Failed to send via relayer');
        } finally {
            setIsRelayerSubmitting(false);
        }
    }, [groth16Result, withdrawCircuit, arbitraryCalldata, toast]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden relative">
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[600px] pointer-events-none overflow-hidden"
                style={{ background: 'radial-gradient(ellipse at center, rgba(167, 139, 250, 0.06) 0%, transparent 60%)' }}
            />
            <div className="max-w-2xl mx-auto relative z-10 w-full">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/40" />
                        <span className="text-primary/50 text-sm">◈</span>
                        <span className="font-mono text-sm md:text-base text-muted-foreground tracking-[0.2em] uppercase">The Withdrawal Ritual</span>
                        <span className="text-primary/50 text-sm">◈</span>
                        <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40" />
                    </div>
                    <h1 className="font-sans text-2xl md:text-3xl lg:text-4xl text-foreground tracking-wider mb-4">WITHDRAW</h1>
                    <p className="font-mono text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Withdraw your private balance to a public address.
                        {isCheckingTokenState && tokenAddress && <span className="block mt-2 text-xs">Checking token state...</span>}
                        {!isCheckingTokenState && tokenAddress && isTokenInitialized !== null && (
                            <span className={`block mt-2 text-xs ${isTokenInitialized ? 'text-accent' : 'text-yellow-400'}`}>
                                {isTokenInitialized ? '✓ Token initialized' : '⚠ Token not initialized - Use Initialize page first'}
                            </span>
                        )}
                    </p>
                </div>

                <div className="relative group w-full min-w-0">
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t border-l border-primary/30" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t border-r border-primary/30" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b border-l border-primary/30" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b border-r border-primary/30" />
                    <div className="absolute inset-0 border border-primary/10" style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)' }} />

                    <Card className="relative bg-card/60 backdrop-blur-sm border-0 w-full min-w-0">
                        <CardHeader className="border-b border-border/30 bg-card/40 py-4 px-4 sm:px-6 mb-4">
                            <div className="flex items-center gap-3 justify-center mb-2">
                                <span className="text-primary/60 text-sm">✧</span>
                                <CardTitle className="text-center text-base sm:text-xl font-sans tracking-wider uppercase" style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}>WITHDRAW</CardTitle>
                                <span className="text-primary/60 text-sm">✧</span>
                            </div>
                            <CardDescription className="text-center text-xs sm:text-sm font-mono text-muted-foreground tracking-wider">WITHDRAW TO PUBLIC ADDRESS</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 w-full">
                            <div className="space-y-4 w-full">
                                {!zkAddress && (
                                    <>
                                        <SpellButton onClick={() => setShowSignDataModal(true)} disabled={isSigning} variant="primary" className="w-full">
                                            {isSigning ? 'SIGNING...' : 'SIGN MESSAGE FOR ARKANA NETWORK ACCESS'}
                                        </SpellButton>
                                        <Dialog open={showSignDataModal} onOpenChange={setShowSignDataModal}>
                                            <DialogContent className="max-w-lg max-h-[85vh] flex flex-col bg-card/95 backdrop-blur-sm border-primary/30">
                                                <DialogHeader>
                                                    <DialogTitle className="text-base font-sans uppercase tracking-wider">
                                                        Data you are signing
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <p className="text-xs text-muted-foreground">
                                                    Your wallet will ask you to sign the message below. This signature is used to derive your private Arkana identity. Verify the content and domain before signing.
                                                </p>
                                                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 overflow-y-auto max-h-[240px]">
                                                    <pre className="text-[11px] font-mono text-foreground whitespace-pre-wrap break-words">
                                                        {ARKANA_MESSAGE}
                                                    </pre>
                                                </div>
                                                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
                                                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                                        ⚠️ Disclaimer: Verify that this data is correct before signing. Only sign on the official Arkana domain. Never share your signature with anyone.
                                                    </p>
                                                </div>
                                                <div className="flex gap-3 justify-end pt-2">
                                                    <Button variant="outline" onClick={() => setShowSignDataModal(false)} disabled={isSigning}>
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={async () => {
                                                            try {
                                                                await handleSign();
                                                                setShowSignDataModal(false);
                                                            } catch {
                                                                // Keep modal open on error
                                                            }
                                                        }}
                                                        disabled={isSigning}
                                                    >
                                                        {isSigning ? 'Signing…' : 'Sign'}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </>
                                )}

                                {zkAddress && (
                                    <div className="relative group w-full min-w-0">
                                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-primary/30" />
                                        <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-primary/30" />
                                        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-primary/30" />
                                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-primary/30" />
                                        <Card className="relative border border-primary/10 bg-card/40 backdrop-blur-sm border-0 w-full min-w-0">
                                            <CardHeader className="border-b border-border/30 bg-card/30 py-3 px-4 sm:px-5 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-primary/60 text-xs">◈</span>
                                                    <CardTitle className="text-xs sm:text-sm font-sans uppercase tracking-wider">WITHDRAW DETAILS</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="w-full">
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1 sm:mb-2">
                                                            <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider">TOKEN ADDRESS</label>
                                                            <Button type="button" onClick={() => setShowTokenSelector(!showTokenSelector)} className="text-xs px-3 py-1.5 h-auto bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50 font-mono uppercase">
                                                                {isLoadingTokens ? 'LOADING...' : showTokenSelector ? 'HIDE TOKENS' : `SELECT FROM AAVE (${aaveTokens.length})`}
                                                            </Button>
                                                        </div>
                                                        {showTokenSelector && (
                                                            <div className="mb-2 max-h-60 overflow-y-auto border border-border/50 bg-card/60 rounded p-2">
                                                                {isLoadingTokens ? <p className="text-xs font-mono text-muted-foreground text-center py-4">Loading...</p> : aaveTokens.length === 0 ? <p className="text-xs font-mono text-muted-foreground text-center py-4">No Aave tokens</p> : (
                                                                    <div className="space-y-1">
                                                                        {aaveTokens.map((token) => (
                                                                            <button key={token.address} type="button" onClick={() => { setTokenAddress(token.address.toLowerCase()); setShowTokenSelector(false); }} className="w-full text-left px-3 py-2 hover:bg-secondary/50 border border-transparent hover:border-accent/30 rounded">
                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <TokenIcon symbol={token.symbol} size={20} />
                                                                                        <div>
                                                                                            <p className="text-xs font-mono text-foreground font-bold">${token.symbol}</p>
                                                                                            <p className="text-[10px] font-mono text-muted-foreground">${token.name} ({token.decimals})</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <p className="text-[10px] font-mono text-accent">{token.address.slice(0, 6)}...{token.address.slice(-4)}</p>
                                                                                </div>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <Input type="text" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value.toLowerCase())} placeholder="0x..." className="text-xs sm:text-sm w-full" />
                                                        {tokenName && tokenSymbol && <p className="text-[10px] font-mono text-accent text-right mt-1">✓ {tokenName} ({tokenSymbol}) - {tokenDecimals} decimals</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider mb-1 sm:mb-2">WITHDRAW AMOUNT {tokenDecimals != null ? `(${tokenDecimals} decimals)` : ''}</label>
                                                        <div className="flex gap-2">
                                                            <Input type="text" value={amount} onChange={(e) => { const v = e.target.value; if (v === '') setAmount(''); else setAmount(v.replace(',', '.')); }} placeholder={tokenDecimals != null ? `e.g. 1.5` : 'Amount'} className="text-xs sm:text-sm flex-1" />
                                                            <Button type="button" onClick={() => { if (availableBalanceAssets != null && tokenDecimals != null) setAmount(formatBalance(availableBalanceAssets, tokenDecimals)); }} disabled={availableBalanceAssets == null || tokenDecimals == null} className="text-xs px-3 py-2 h-auto bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50 font-mono uppercase">MAX</Button>
                                                        </div>
                                                        {availableBalance != null && (
                                                            <p className="text-[10px] font-mono text-muted-foreground mt-1 text-right">
                                                                Available: {availableBalance.toString()} shares
                                                                {availableBalanceAssets != null && tokenDecimals != null && tokenSymbol && <> ≈ {formatBalance(availableBalanceAssets, tokenDecimals)} {tokenSymbol}</>}
                                                                {canAbsorb && <span className="ml-1 text-primary">(includes absorbable)</span>}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider mb-1 sm:mb-2">RECEIVER ADDRESS</label>
                                                        <Input type="text" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value.toLowerCase())} placeholder="0x..." className="text-xs sm:text-sm w-full" />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider mb-1 sm:mb-2">RELAYER FEE AMOUNT {tokenDecimals != null ? `(${tokenDecimals} decimals)` : ''}</label>
                                                        <Input type="text" value={receiverFeeAmount} onChange={(e) => { const v = e.target.value; if (v === '') setReceiverFeeAmount(''); else setReceiverFeeAmount(v.replace(',', '.')); }} placeholder={tokenDecimals != null ? 'e.g. 0.01' : 'Fee'} className="text-xs sm:text-sm w-full" />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <input type="checkbox" id="customSpell" checked={isCustomSpell} onChange={(e) => { const c = e.target.checked; setIsCustomSpell(c); if (!c) setArbitraryCalldata(''); }} className="w-4 h-4 rounded border-primary/50 bg-card/40 text-primary" />
                                                            <label htmlFor="customSpell" className="text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider cursor-pointer">Custom Spell (arbitrary calldata)</label>
                                                        </div>
                                                        {isCustomSpell && (
                                                            <div className="ml-6 border-l-2 border-primary/30 pl-3 py-2">
                                                                <label className="block text-xs font-sans font-bold text-foreground uppercase tracking-wider mb-1">ARBITRARY CALLDATA (HEX)</label>
                                                                <Input type="text" value={arbitraryCalldata} onChange={(e) => setArbitraryCalldata(e.target.value)} placeholder="0x..." className="text-xs w-full" />
                                                                {arbitraryCalldata?.trim() && <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">Hash: {arbitraryCalldataHash}</p>}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {tokenCurrentNonce != null && (
                                                        <div className="border border-primary/20 bg-card/40 p-3 rounded-sm">
                                                            <p className="text-xs font-mono text-foreground">NEXT NONCE: <span className="font-bold text-primary">{tokenCurrentNonce.toString()}</span></p>
                                                            <p className="text-[10px] font-mono text-muted-foreground uppercase">Using prev nonce {(tokenCurrentNonce > BigInt(0) ? tokenCurrentNonce - BigInt(1) : BigInt(0)).toString()} for withdraw</p>
                                                        </div>
                                                    )}

                                                    {!proof ? (
                                                        <>
                                                            <SpellButton onClick={() => setShowProofConfirmModal(true)} disabled={isProving || isCalculatingInputs || !tokenAddress || !amount || !receiverAddress || !receiverFeeAmount || tokenCurrentNonce === null || isTokenInitialized === false} variant="primary" className="w-full text-xs sm:text-sm">
                                                                {isCalculatingInputs ? 'CALCULATING INPUTS...' : isProving ? `GENERATING PROOF... (${currentProvingTime}MS)` : isTokenInitialized === false ? 'TOKEN NOT INITIALIZED' : 'GENERATE WITHDRAW PROOF'}
                                                            </SpellButton>
                                                            <ProofParamsConfirmModal
                                                                open={showProofConfirmModal}
                                                                onOpenChange={setShowProofConfirmModal}
                                                                onConfirm={proveWithdraw}
                                                                title="Confirm EdDSA signing (withdraw)"
                                                                description="You are about to generate a proof that commits to the following parameters. This step uses your EdDSA identity. Verify everything before confirming."
                                                                params={[
                                                                    { label: 'Token', value: tokenSymbol ? `${tokenSymbol} (${tokenAddress.slice(0, 10)}…)` : tokenAddress, mono: false },
                                                                    { label: 'Amount', value: amount || '—', mono: false },
                                                                    { label: 'Receiver address', value: receiverAddress ? `${receiverAddress.slice(0, 10)}…${receiverAddress.slice(-8)}` : '—', mono: true },
                                                                    { label: 'Relayer fee', value: receiverFeeAmount || '—', mono: false },
                                                                    { label: 'Next nonce', value: tokenCurrentNonce != null ? tokenCurrentNonce.toString() : '—', mono: true },
                                                                ]}
                                                                disclaimer="Verify that these parameters are correct before confirming. By confirming you authorize generating a zero-knowledge proof that commits to these values (EdDSA signing)."
                                                                confirmLabel="Confirm & generate proof"
                                                                isSigning={isProving}
                                                            />
                                                        </>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <SpellButton onClick={handleWithdrawViaRelayer} disabled={!groth16Result || isPending || isConfirming || isSubmitting || isSimulating || isRelayerSubmitting} variant="primary" className="w-full text-xs sm:text-sm">
                                                                {isRelayerSubmitting ? 'SENDING VIA RELAYER...' : relayerTxHash ? '✓ SENT VIA RELAYER' : 'SEND TO RELAYER'}
                                                            </SpellButton>
                                                            <SpellButton onClick={handleWithdraw} disabled={isPending || isConfirming || isSubmitting || isSimulating || isRelayerSubmitting} variant="secondary" className="w-full text-xs sm:text-sm">
                                                                {isSimulating ? 'SIMULATING...' : isPending || isSubmitting ? 'PREPARING...' : isConfirming ? 'CONFIRMING...' : 'SEND YOURSELF (TEST)'}
                                                            </SpellButton>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {proofError && (
                                    <div className="relative border border-destructive/30 bg-card/40 backdrop-blur-sm p-4 rounded-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-destructive/60 text-sm">✗</span>
                                            <p className="text-sm font-mono text-destructive uppercase tracking-wider">{proofError}</p>
                                        </div>
                                    </div>
                                )}

                                {txHash && (
                                    <div className="mt-2 border border-primary/20 bg-card/40 p-3 rounded-sm">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                                            <span className="text-xs font-mono text-muted-foreground uppercase">TX HASH:</span>
                                            <a href="#" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-primary hover:text-primary/70 underline break-all">{txHash.slice(0, 12)}...{txHash.slice(-6)}</a>
                                        </div>
                                        {isConfirming && <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase">WAITING FOR CONFIRMATION...</p>}
                                        {isConfirmed && <p className="text-[10px] font-mono text-accent font-bold mt-1 uppercase">[CONFIRMED]</p>}
                                    </div>
                                )}

                                {provingTime != null && <p className="text-xs font-mono text-muted-foreground text-center">Proof generated in <span className="text-primary">{provingTime}ms</span></p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="w-full max-w-4xl mx-auto mt-12 px-4 sm:px-8">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                        <span className="text-primary/30 text-lg">✧</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                    </div>
                </div>
            </div>

            <TransactionModal
                isOpen={showTransactionModal}
                onClose={() => setShowTransactionModal(false)}
                isProving={isProving}
                isPending={isPending || isSubmitting || isRelayerSubmitting}
                isConfirming={isConfirming}
                isConfirmed={isConfirmed || !!relayerTxHash}
                txHash={txHash || relayerTxHash}
                error={txError || proofError || relayerError || null}
                transactionType="WITHDRAW"
            />
        </div>
    );
}
