'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import { type Address } from 'viem';
import { useAccount } from '@/context/AccountProvider';
import { useAaveTokens } from '@/hooks/useAaveTokens';
import { computePrivateKeyFromSignature } from '@/lib/circuit-utils';
import { TLSWAP_REGISTER_ADDRESS, TLSWAP_REGISTER_ABI } from '@/lib/abi/TlSwapRegister';
import {
    decryptTimelockOrder,
    fetchDrandSignature,
    parseOrFetchEncryptedData,
    getCurrentRound,
    getRoundTimestamp,
    type DecryptedOrder,
    type EncryptedOrderData
} from '@/lib/timelock-decrypt';
import { ensureBufferPolyfill } from '@/lib/buffer-polyfill';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TokenIcon } from '@/lib/token-icons';
import { Loader2, Lock, Unlock, Clock, AlertCircle, CheckCircle2, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

interface DecryptedChunk {
    order: DecryptedOrder;
    round: number;
    roundTimestamp: Date;
    chunkIndex: number;
}

interface PendingChunk {
    encryptedData: EncryptedOrderData;
    targetRound: number;
    availableAt: Date;
    chunkIndex: number;
}

interface OrderStatus {
    loading: boolean;
    error?: string;
    ipfsCid?: string;
    decryptedChunks: DecryptedChunk[];
    pendingChunks: PendingChunk[];
    nonceCommitment?: string;
    currentRound: number;
}

export function DecryptOrder() {
    const publicClient = usePublicClient();
    const chainId = useChainId();
    const { account } = useAccount();
    const { tokens: aaveTokens, isLoading: isLoadingTokens } = useAaveTokens();

    // Simple inputs
    const [selectedToken, setSelectedToken] = useState<string>('');
    const [nonceInput, setNonceInput] = useState<string>('0');

    // Status
    const [status, setStatus] = useState<OrderStatus>({
        loading: false,
        decryptedChunks: [],
        pendingChunks: [],
        currentRound: getCurrentRound()
    });
    const [userKey, setUserKey] = useState<bigint | null>(null);
    const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set([0]));

    // Derive user key from signature on mount
    useEffect(() => {
        const deriveUserKey = async () => {
            if (!account?.signature) return;
            try {
                const userKeyHex = await computePrivateKeyFromSignature(account.signature);
                const uk = BigInt(userKeyHex.startsWith('0x') ? userKeyHex : '0x' + userKeyHex);
                setUserKey(uk);
            } catch (e) {
                console.error('Failed to derive user key:', e);
            }
        };
        deriveUserKey();
    }, [account?.signature]);

    // Update current round periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setStatus(prev => ({ ...prev, currentRound: getCurrentRound() }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Compute nonce commitment
    const computeNonceCommitment = useCallback(async (tokenAddress: string, nonce: bigint): Promise<string> => {
        if (!userKey) throw new Error('User key not available');

        await ensureBufferPolyfill();
        const { poseidon2Hash } = await import('@aztec/foundation/crypto');

        const tokenBigInt = BigInt(tokenAddress);
        const chainIdBigInt = BigInt(chainId);

        // spending_key = poseidon2([user_key, chain_id, token_address])
        const spendingKeyResult = await poseidon2Hash([userKey, chainIdBigInt, tokenBigInt]);
        const spendingKey = typeof spendingKeyResult === 'bigint'
            ? spendingKeyResult
            : spendingKeyResult.toBigInt();

        // nonce_commitment = poseidon2([spending_key, nonce, token_address])
        const commitmentResult = await poseidon2Hash([spendingKey, nonce, tokenBigInt]);
        const commitment = typeof commitmentResult === 'bigint'
            ? commitmentResult
            : commitmentResult.toBigInt();

        return '0x' + commitment.toString(16).padStart(64, '0');
    }, [userKey, chainId]);

    // Fetch encrypted order from contract
    const fetchEncryptedOrder = useCallback(async (commitment: string): Promise<string> => {
        if (!publicClient) throw new Error('No public client');

        const ciphertextBytes = await publicClient.readContract({
            address: TLSWAP_REGISTER_ADDRESS as Address,
            abi: TLSWAP_REGISTER_ABI,
            functionName: 'encryptedOrdersByNonce',
            args: [commitment as `0x${string}`]
        });

        if (!ciphertextBytes || ciphertextBytes === '0x' || (ciphertextBytes as string).length <= 2) {
            throw new Error('No encrypted order found for this commitment');
        }

        // Decode bytes to string (could be IPFS CID or JSON)
        const hexStr = (ciphertextBytes as string).slice(2);
        const bytes = new Uint8Array(hexStr.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        return new TextDecoder().decode(bytes);
    }, [publicClient]);

    // Recursively decrypt all available chunks in the chain
    const decryptChain = useCallback(async (dataOrCid: string, chunkIndex: number = 0): Promise<{
        decrypted: DecryptedChunk[];
        pending: PendingChunk[];
    }> => {
        const decrypted: DecryptedChunk[] = [];
        const pending: PendingChunk[] = [];

        let currentData: string | null = dataOrCid;
        let currentIndex = chunkIndex;

        while (currentData) {
            try {
                const encryptedData = await parseOrFetchEncryptedData(currentData);
                const targetRound = encryptedData.timelock.targetRound;
                const currentRound = getCurrentRound();
                const availableAt = new Date(getRoundTimestamp(targetRound) * 1000);

                if (currentRound < targetRound) {
                    // Round not yet available
                    pending.push({
                        encryptedData,
                        targetRound,
                        availableAt,
                        chunkIndex: currentIndex
                    });
                    break; // Can't continue chain until this is decrypted
                }

                // Decrypt this chunk
                const signature = await fetchDrandSignature(targetRound);
                const order = await decryptTimelockOrder(encryptedData, signature);

                decrypted.push({
                    order,
                    round: targetRound,
                    roundTimestamp: availableAt,
                    chunkIndex: currentIndex
                });

                // Check for nested ciphertext
                if (order.nextCiphertext) {
                    currentData = order.nextCiphertext;
                    currentIndex++;
                } else {
                    currentData = null;
                }
            } catch (e) {
                console.error(`Error decrypting chunk ${currentIndex}:`, e);
                break;
            }
        }

        return { decrypted, pending };
    }, []);

    // Main decrypt flow
    const handleDecrypt = useCallback(async () => {
        if (!selectedToken || !userKey) {
            setStatus(prev => ({ ...prev, loading: false, error: 'Please select a token and ensure you are signed in' }));
            return;
        }

        setStatus({
            loading: true,
            decryptedChunks: [],
            pendingChunks: [],
            currentRound: getCurrentRound()
        });

        try {
            const nonce = BigInt(nonceInput || '0');

            // Compute nonce commitment
            const commitment = await computeNonceCommitment(selectedToken, nonce);
            setStatus(prev => ({ ...prev, nonceCommitment: commitment }));

            // Fetch data from contract
            const ipfsCid = await fetchEncryptedOrder(commitment);
            setStatus(prev => ({ ...prev, ipfsCid }));

            // Decrypt entire chain
            const { decrypted, pending } = await decryptChain(ipfsCid);

            setStatus(prev => ({
                ...prev,
                loading: false,
                decryptedChunks: decrypted,
                pendingChunks: pending,
                error: decrypted.length === 0 && pending.length > 0
                    ? `First order not yet decryptable. Available at ${pending[0].availableAt.toLocaleString()}`
                    : undefined
            }));

        } catch (e) {
            setStatus(prev => ({
                ...prev,
                loading: false,
                error: (e as Error).message
            }));
        }
    }, [selectedToken, nonceInput, userKey, computeNonceCommitment, fetchEncryptedOrder, decryptChain]);

    // Format timestamp
    const formatTime = (date: Date) => date.toLocaleString();

    // Get selected token info
    const selectedTokenInfo = aaveTokens?.find(t => t.address?.toLowerCase() === selectedToken.toLowerCase());

    // Check if user is signed in
    const isSignedIn = !!account?.signature && !!userKey;

    const toggleChunk = (index: number) => {
        setExpandedChunks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto bg-card border-border">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Lock className="w-5 h-5" />
                    Decrypt Timelock Order
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    Decrypt encrypted swap orders using your signed-in account
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* Sign-in status */}
                {!isSignedIn && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-sm flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        <span className="text-destructive/90">Please sign in (Sign Sigil) to decrypt orders</span>
                    </div>
                )}

                {isSignedIn && (
                    <>
                        {/* Token Dropdown */}
                        <div className="space-y-2">
                            <label className="text-foreground text-sm font-medium">Token</label>
                            <select
                                value={selectedToken}
                                onChange={(e) => setSelectedToken(e.target.value)}
                                className="w-full h-10 px-3 bg-card border border-border text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="">{isLoadingTokens ? "Loading tokens..." : "Select a token"}</option>
                                {aaveTokens?.map((token) => (
                                    <option
                                        key={token.address}
                                        value={token.address}
                                    >
                                        {token.symbol} - {token.address.slice(0, 6)}...{token.address.slice(-4)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nonce Input */}
                        <div className="space-y-2">
                            <label className="text-foreground text-sm font-medium">Nonce</label>
                            <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={nonceInput}
                                onChange={(e) => setNonceInput(e.target.value)}
                                className="bg-card border-border text-foreground font-mono"
                            />
                            <p className="text-xs text-muted-foreground">Enter the nonce for the order you want to decrypt</p>
                        </div>

                        {/* Current Round Info */}
                        <div className="p-2 bg-secondary/30 rounded-sm text-xs text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Current drand round: <span className="font-mono text-foreground">{status.currentRound}</span>
                        </div>

                        {/* Decrypt Button */}
                        <Button
                            onClick={handleDecrypt}
                            disabled={status.loading || !selectedToken}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            {status.loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Decrypting Chain...
                                </>
                            ) : (
                                <>
                                    <Unlock className="w-4 h-4 mr-2" />
                                    Decrypt Order Chain
                                </>
                            )}
                        </Button>
                    </>
                )}

                {/* Computed Commitment */}
                {status.nonceCommitment && (
                    <div className="p-3 bg-secondary/30 rounded-sm">
                        <span className="text-muted-foreground text-xs">Nonce Commitment</span>
                        <code className="text-xs text-primary break-all block mt-1">{status.nonceCommitment}</code>
                    </div>
                )}

                {/* Error Display */}
                {status.error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-sm flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-destructive font-medium">Error</p>
                            <p className="text-destructive/80 text-sm">{status.error}</p>
                        </div>
                    </div>
                )}

                {/* Decrypted Chunks */}
                {status.decryptedChunks.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-accent" />
                            <span className="text-accent font-medium">
                                {status.decryptedChunks.length} Order{status.decryptedChunks.length > 1 ? 's' : ''} Decrypted
                            </span>
                        </div>

                        {status.decryptedChunks.map((chunk) => (
                            <div key={chunk.chunkIndex} className="border border-border/50 rounded-sm overflow-hidden">
                                <button
                                    onClick={() => toggleChunk(chunk.chunkIndex)}
                                    className="w-full p-3 bg-secondary/30 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        {expandedChunks.has(chunk.chunkIndex) ? (
                                            <ChevronDown className="w-4 h-4 text-primary" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-primary" />
                                        )}
                                        <Unlock className="w-4 h-4 text-accent" />
                                        <span className="text-foreground font-medium">Order #{chunk.chunkIndex + 1}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        Round {chunk.round}
                                    </span>
                                </button>

                                {expandedChunks.has(chunk.chunkIndex) && (
                                    <div className="p-4 space-y-3 bg-card/50">
                                        <div className="grid gap-2 text-sm">
                                            <OrderField label="Shares Amount" value={chunk.order.sharesAmount} />
                                            <OrderField label="Amount Out Min" value={chunk.order.amountOutMin} />
                                            <OrderField label="Slippage (BPS)" value={chunk.order.slippageBps.toString()} />
                                            <OrderField label="Deadline" value={new Date(chunk.order.deadline * 1000).toLocaleString()} />
                                            <OrderField label="Recipient" value={chunk.order.recipient} mono />
                                            <OrderField label="Token Out" value={chunk.order.tokenOut} mono />
                                            <OrderField label="Execution Fee (BPS)" value={chunk.order.executionFeeBps.toString()} />
                                        </div>

                                        <div className="pt-2 border-t border-border/30">
                                            <span className="text-muted-foreground text-xs">Hash Chain</span>
                                            <div className="mt-1 grid gap-1 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Prev:</span>
                                                    <span className="font-mono text-foreground/70 truncate max-w-[200px]" title={chunk.order.prevHash}>
                                                        {chunk.order.prevHash.slice(0, 16)}...
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Next:</span>
                                                    <span className="font-mono text-foreground/70 truncate max-w-[200px]" title={chunk.order.nextHash}>
                                                        {chunk.order.nextHash.slice(0, 16)}...
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pending Chunks (not yet decryptable) */}
                {status.pendingChunks.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-chart-4" />
                            <span className="text-chart-4 font-medium">
                                {status.pendingChunks.length} Order{status.pendingChunks.length > 1 ? 's' : ''} Pending
                            </span>
                        </div>

                        {status.pendingChunks.map((pending) => (
                            <div key={pending.chunkIndex} className="p-4 bg-chart-4/10 border border-chart-4/30 rounded-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-chart-4" />
                                        <span className="text-foreground font-medium">Order #{pending.chunkIndex + 1}</span>
                                    </div>
                                    <span className="text-xs text-chart-4">Locked</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Target Round:</div>
                                    <div className="text-foreground font-mono">{pending.targetRound}</div>
                                    <div className="text-muted-foreground">Current Round:</div>
                                    <div className="text-foreground font-mono">{status.currentRound}</div>
                                    <div className="text-muted-foreground">Decryptable At:</div>
                                    <div className="text-foreground">{formatTime(pending.availableAt)}</div>
                                    <div className="text-muted-foreground">Rounds Until:</div>
                                    <div className="text-chart-4 font-mono">
                                        {pending.targetRound - status.currentRound} (~{Math.ceil((pending.targetRound - status.currentRound) * 3 / 60)} min)
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Data Source Info */}
                {status.ipfsCid && (
                    <div className="p-3 bg-secondary/20 rounded-sm">
                        <span className="text-muted-foreground text-xs">
                            {status.ipfsCid.trim().startsWith('{') ? 'Data Source: Contract (Direct JSON)' : 'Data Source: IPFS'}
                        </span>
                        {!status.ipfsCid.trim().startsWith('{') && (
                            <div className="flex items-center gap-2 mt-1">
                                <code className="text-xs text-primary break-all">
                                    {status.ipfsCid}
                                </code>
                                <a
                                    href={`https://dweb.link/ipfs/${status.ipfsCid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Helper component for order fields
function OrderField({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground flex-shrink-0">{label}:</span>
            <span
                className={`text-foreground text-right break-all ${mono ? 'font-mono text-xs' : ''}`}
            >
                {value}
            </span>
        </div>
    );
}

export default DecryptOrder;
