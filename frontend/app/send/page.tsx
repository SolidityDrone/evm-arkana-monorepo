'use client';

import React, { useState, useMemo } from 'react';
import { useSend } from '@/hooks/useSend';
import { useAaveTokens } from '@/hooks/useAaveTokens';
import { useAccountSigning } from '@/hooks/useAccountSigning';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SpellButton } from '@/components/spell-button';
import TransactionModal from '@/components/TransactionModal';
import { useToast } from '@/components/Toast';
import { TokenIcon } from '@/lib/token-icons';
import { parseZkAddress, validateZkAddress } from '@/lib/zk-address';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCode } from 'lucide-react';
import { ProofParamsConfirmModal } from '@/components/ProofParamsConfirmModal';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from '@/lib/abi/ArkanaConst';
import { encodeFunctionData } from 'viem';

export default function SendPage() {
    const { toast } = useToast();
    const {
        zkAddress,
        tokenAddress,
        setTokenAddress,
        tokenDecimals,
        amount,
        setAmount,
        receiverZkAddress,
        setReceiverZkAddress,
        relayerFeeAmount,
        setRelayerFeeAmount,
        tokenName,
        tokenSymbol,
        isProving,
        proof,
        proofError,
        provingTime,
        currentProvingTime,
        isSubmitting,
        isSimulating,
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
        sendCircuit,
        proveSend,
        handleSend,
    } = useSend();

    const { handleSign, isSigning } = useAccountSigning();
    const { tokens: aaveTokens, isLoading: isLoadingTokens } = useAaveTokens();
    const [showTokenSelector, setShowTokenSelector] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showQrPasteModal, setShowQrPasteModal] = useState(false);
    const [qrPasteValue, setQrPasteValue] = useState('');
    const [qrPasteError, setQrPasteError] = useState<string | null>(null);
    const [showProofConfirmModal, setShowProofConfirmModal] = useState(false);
    const [isRelayerSubmitting, setIsRelayerSubmitting] = useState(false);
    const [relayerTxHash, setRelayerTxHash] = useState<string | null>(null);
    const [relayerError, setRelayerError] = useState<string | null>(null);

    React.useEffect(() => {
        if (isProving || isPending || isConfirming || isConfirmed) setShowTransactionModal(true);
    }, [isProving, isPending, isConfirming, isConfirmed]);
    React.useEffect(() => {
        if (isConfirmed && txHash) toast('SEND TRANSACTION CONFIRMED', 'success');
    }, [isConfirmed, txHash, toast]);
    React.useEffect(() => {
        if (txError) setShowTransactionModal(true);
    }, [txError]);
    React.useEffect(() => {
        if (isRelayerSubmitting || relayerTxHash) setShowTransactionModal(true);
    }, [isRelayerSubmitting, relayerTxHash]);

    const handleSendViaRelayer = React.useCallback(async () => {
        if (!groth16Result?.publicSignals || groth16Result.publicSignals.length < 17) {
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
            const publicSignals = groth16Result.publicSignals.slice(0, 17).map((s: string) => BigInt(s)) as [
                bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint
            ];
            const calldata = encodeFunctionData({
                abi: ArkanaAbi,
                functionName: sendCircuit === 'absorb_send' ? 'absorbSend' : 'send',
                args: [pA, pB, pC, publicSignals],
            });
            const response = await fetch('/api/relayer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: ArkanaAddress, data: calldata, gasLimit: '3000000' }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || 'Relayer request failed');
            setRelayerTxHash(result.hash);
            toast('SEND TRANSACTION CONFIRMED (VIA RELAYER)', 'success');
        } catch (e) {
            setRelayerError(e instanceof Error ? e.message : 'Failed to send via relayer');
        } finally {
            setIsRelayerSubmitting(false);
        }
    }, [groth16Result, sendCircuit, toast]);

    const formatBalance = (balance: bigint | null, decimals: number | null): string => {
        if (balance === null || decimals === null) return '0';
        const divisor = BigInt(10 ** decimals);
        const intPart = balance / divisor;
        const decPart = balance % divisor;
        const decStr = decPart.toString().padStart(decimals, '0').replace(/0+$/, '');
        return decStr === '' ? intPart.toString() : `${intPart}.${decStr}`;
    };

    const receiverZkValidation = useMemo(() => validateZkAddress(receiverZkAddress.trim()), [receiverZkAddress]);

    const handleUsePastedZkAddress = () => {
        const raw = qrPasteValue.trim();
        if (!raw) {
            setQrPasteError('Enter a zk address');
            return;
        }
        const result = validateZkAddress(raw);
        if (!result.valid) {
            setQrPasteError(result.error ?? 'Invalid zk address');
            return;
        }
        setReceiverZkAddress(raw);
        setQrPasteError(null);
        setQrPasteValue('');
        setShowQrPasteModal(false);
    };

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
                        <span className="font-mono text-sm md:text-base text-muted-foreground tracking-[0.2em] uppercase">Private Send</span>
                        <span className="text-primary/50 text-sm">◈</span>
                        <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40" />
                    </div>
                    <h1 className="font-sans text-2xl md:text-3xl lg:text-4xl text-foreground tracking-wider mb-4">SEND</h1>
                    <p className="font-mono text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Send to another Arkana zk address (private).
                        {isCheckingTokenState && tokenAddress && <span className="block mt-2 text-xs">Checking token state...</span>}
                        {!isCheckingTokenState && tokenAddress && isTokenInitialized !== null && (
                            <span className={`block mt-2 text-xs ${isTokenInitialized ? 'text-accent' : 'text-yellow-400'}`}>
                                {isTokenInitialized ? '✓ Token initialized' : '⚠ Token not initialized — use Initialize first'}
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
                                <CardTitle className="text-center text-base sm:text-xl font-sans tracking-wider uppercase" style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}>SEND</CardTitle>
                                <span className="text-primary/60 text-sm">✧</span>
                            </div>
                            <CardDescription className="text-center text-xs sm:text-sm font-mono text-muted-foreground tracking-wider">SEND TO ZK ADDRESS</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 w-full">
                            <div className="space-y-4 w-full">
                                {!zkAddress && (
                                    <SpellButton onClick={handleSign} disabled={isSigning} variant="primary" className="w-full">
                                        {isSigning ? 'SIGNING...' : 'SIGN MESSAGE FOR ARKANA NETWORK ACCESS'}
                                    </SpellButton>
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
                                                    <CardTitle className="text-xs sm:text-sm font-sans uppercase tracking-wider">SEND DETAILS</CardTitle>
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
                                                        {tokenName && tokenSymbol && <p className="text-[10px] font-mono text-accent text-right mt-1">✓ {tokenName} ({tokenSymbol}) — {tokenDecimals} decimals</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider mb-1 sm:mb-2">AMOUNT {tokenDecimals != null ? `(${tokenDecimals} decimals)` : ''}</label>
                                                        <div className="flex gap-2">
                                                            <Input type="text" value={amount} onChange={(e) => { const v = e.target.value; if (v === '') setAmount(''); else setAmount(v.replace(',', '.')); }} placeholder={tokenDecimals != null ? 'e.g. 1.5' : 'Amount'} className="text-xs sm:text-sm flex-1" />
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
                                                        <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider mb-1 sm:mb-2">RECEIVER ZK ADDRESS</label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="text"
                                                                value={receiverZkAddress}
                                                                onChange={(e) => setReceiverZkAddress(e.target.value)}
                                                                placeholder="zk... or paste 128 hex (x,y)"
                                                                className="text-xs sm:text-sm flex-1 font-mono"
                                                            />
                                                            <Button
                                                                type="button"
                                                                onClick={() => { setShowQrPasteModal(true); setQrPasteError(null); setQrPasteValue(receiverZkAddress); }}
                                                                className="text-xs px-3 py-2 h-auto bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 font-mono uppercase shrink-0 flex items-center gap-1"
                                                                title="Scan QR or paste zk address"
                                                            >
                                                                <QrCode className="w-4 h-4" /> SCAN QR
                                                            </Button>
                                                        </div>
                                                        {receiverZkAddress.trim() ? (
                                                            receiverZkValidation.valid && receiverZkValidation.x != null && receiverZkValidation.y != null ? (
                                                                <p className="text-[10px] font-mono text-accent mt-1.5 break-all" title={`x: ${receiverZkValidation.x.toString()}\ny: ${receiverZkValidation.y.toString()}`}>
                                                                    <span className="text-muted-foreground">x: </span>{receiverZkValidation.x.toString(16).length > 24 ? `${receiverZkValidation.x.toString(16).slice(0, 12)}…${receiverZkValidation.x.toString(16).slice(-8)}` : receiverZkValidation.x.toString(16)}{' '}
                                                                    <span className="text-muted-foreground">y: </span>{receiverZkValidation.y.toString(16).length > 24 ? `${receiverZkValidation.y.toString(16).slice(0, 12)}…${receiverZkValidation.y.toString(16).slice(-8)}` : receiverZkValidation.y.toString(16)}
                                                                </p>
                                                            ) : (
                                                                <p className="text-[10px] font-mono text-destructive mt-1.5">{receiverZkValidation.error ?? 'Invalid zk address'}</p>
                                                            )
                                                        ) : (
                                                            <p className="text-[10px] font-mono text-muted-foreground mt-1">Format: zk + 64 hex (x) + 64 hex (y). Paste or scan receiver&apos;s QR.</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider mb-1 sm:mb-2">RELAYER FEE AMOUNT {tokenDecimals != null ? `(${tokenDecimals} decimals)` : ''}</label>
                                                        <Input type="text" value={relayerFeeAmount} onChange={(e) => { const v = e.target.value; if (v === '') setRelayerFeeAmount(''); else setRelayerFeeAmount(v.replace(',', '.')); }} placeholder={tokenDecimals != null ? 'e.g. 0.01' : 'Fee'} className="text-xs sm:text-sm w-full" />
                                                    </div>

                                                    {tokenCurrentNonce != null && (
                                                        <div className="border border-primary/20 bg-card/40 p-3 rounded-sm">
                                                            <p className="text-xs font-mono text-foreground">NEXT NONCE: <span className="font-bold text-primary">{tokenCurrentNonce.toString()}</span></p>
                                                            <p className="text-[10px] font-mono text-muted-foreground uppercase">Using prev nonce {(tokenCurrentNonce > 0n ? tokenCurrentNonce - 1n : 0n).toString()} for send</p>
                                                        </div>
                                                    )}

                                                    {!proof ? (
                                                        <>
                                                            <SpellButton onClick={() => setShowProofConfirmModal(true)} disabled={isProving || isCalculatingInputs || !tokenAddress || !amount || !receiverZkAddress.trim() || !relayerFeeAmount || !receiverZkValidation.valid || tokenCurrentNonce === null || isTokenInitialized === false} variant="primary" className="w-full text-xs sm:text-sm">
                                                                {isCalculatingInputs ? 'CALCULATING INPUTS...' : isProving ? `GENERATING PROOF... (${currentProvingTime}MS)` : isTokenInitialized === false ? 'TOKEN NOT INITIALIZED' : 'GENERATE SEND PROOF'}
                                                            </SpellButton>
                                                            <ProofParamsConfirmModal
                                                                open={showProofConfirmModal}
                                                                onOpenChange={setShowProofConfirmModal}
                                                                onConfirm={proveSend}
                                                                title="Confirm EdDSA signing (send)"
                                                                description="You are about to generate a proof that commits to the following parameters. This step uses your EdDSA identity. Verify everything before confirming."
                                                                params={[
                                                                    { label: 'Token', value: tokenSymbol ? `${tokenSymbol} (${tokenAddress.slice(0, 10)}…)` : tokenAddress, mono: false },
                                                                    { label: 'Amount', value: amount || '—', mono: false },
                                                                    { label: 'Receiver (zk)', value: receiverZkAddress.trim() ? `${receiverZkAddress.trim().slice(0, 14)}…${receiverZkAddress.trim().slice(-10)}` : '—', mono: true },
                                                                    { label: 'Relayer fee', value: relayerFeeAmount || '—', mono: false },
                                                                    { label: 'Next nonce', value: tokenCurrentNonce != null ? tokenCurrentNonce.toString() : '—', mono: true },
                                                                ]}
                                                                disclaimer="Verify that these parameters are correct before confirming. By confirming you authorize generating a zero-knowledge proof that commits to these values (EdDSA signing)."
                                                                confirmLabel="Confirm & generate proof"
                                                                isSigning={isProving}
                                                            />
                                                        </>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <SpellButton onClick={handleSendViaRelayer} disabled={!groth16Result || isPending || isConfirming || isSubmitting || isSimulating || isRelayerSubmitting} variant="primary" className="w-full text-xs sm:text-sm">
                                                                {isRelayerSubmitting ? 'SENDING VIA RELAYER...' : relayerTxHash ? '✓ SENT VIA RELAYER' : 'SEND TO RELAYER'}
                                                            </SpellButton>
                                                            <SpellButton onClick={handleSend} disabled={isPending || isConfirming || isSubmitting || isSimulating || isRelayerSubmitting} variant="secondary" className="w-full text-xs sm:text-sm">
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
                transactionType="SEND"
            />

            <Dialog open={showQrPasteModal} onOpenChange={setShowQrPasteModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-mono uppercase tracking-wider">Scan QR or paste zk address</DialogTitle>
                    </DialogHeader>
                    <p className="text-xs font-mono text-muted-foreground">
                        Paste the receiver&apos;s zk address below. You can scan their QR with your phone and paste the result, or type it manually (zk + 128 hex characters).
                    </p>
                    <Input
                        type="text"
                        value={qrPasteValue}
                        onChange={(e) => { setQrPasteValue(e.target.value); setQrPasteError(null); }}
                        placeholder="zk..."
                        className="font-mono text-sm mt-2"
                    />
                    {qrPasteError && <p className="text-xs text-destructive mt-1">{qrPasteError}</p>}
                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleUsePastedZkAddress} className="flex-1 font-mono uppercase">Use this address</Button>
                        <Button variant="outline" onClick={() => setShowQrPasteModal(false)} className="font-mono uppercase">Cancel</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
