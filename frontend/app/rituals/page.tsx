'use client';

import React, { useState, useEffect } from 'react';
import { useInitialize } from '@/hooks/useInitialize';
import { useDeposit } from '@/hooks/useDeposit';
import { useAaveTokens } from '@/hooks/useAaveTokens';
import { useZkAddress } from '@/context/AccountProvider';
import { useAccountSigning } from '@/hooks/useAccountSigning';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SpellButton } from '@/components/spell-button';
import TransactionModal from '@/components/TransactionModal';
import { useToast } from '@/components/Toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TokenIcon } from '@/lib/token-icons';

export default function RitualsPage() {
    const { toast } = useToast();
    const zkAddress = useZkAddress();
    const { handleSign, isSigning } = useAccountSigning();
    const { tokens: aaveTokens, isLoading: isLoadingTokens } = useAaveTokens();
    const [showTokenSelector, setShowTokenSelector] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);

    // Initialize hook
    const initializeHook = useInitialize();
    // Deposit hook
    const depositHook = useDeposit();

    // Use tokenAddress from deposit hook (it auto-discovers nonce)
    const [tokenAddress, setTokenAddress] = useState('');
    const [tokenDecimals, setTokenDecimals] = useState<number | null>(null);
    const [tokenName, setTokenName] = useState<string>('');
    const [tokenSymbol, setTokenSymbol] = useState<string>('');

    // Determine which hook to use based on token initialization state
    const isTokenInitialized = depositHook.isTokenInitialized;
    const tokenCurrentNonce = depositHook.tokenCurrentNonce;
    const isCheckingTokenState = depositHook.isCheckingTokenState;

    // Use the appropriate hook based on initialization state
    const activeHook = isTokenInitialized === true && tokenCurrentNonce !== null && tokenCurrentNonce > BigInt(0)
        ? depositHook
        : initializeHook;

    // Sync tokenAddress between hooks
    useEffect(() => {
        if (tokenAddress) {
            initializeHook.setTokenAddress(tokenAddress);
            depositHook.setTokenAddress(tokenAddress);
        }
    }, [tokenAddress, initializeHook, depositHook]);

    // Show modal when proof is generating, transaction is pending, confirming, or confirmed
    React.useEffect(() => {
        const isProving = activeHook.isProving || false;
        const isPending = activeHook.isPending || false;
        const isConfirming = activeHook.isConfirming || false;
        const isConfirmed = activeHook.isConfirmed || false;
        if (isProving || isPending || isConfirming || isConfirmed) {
            setShowTransactionModal(true);
        }
    }, [activeHook.isProving, activeHook.isPending, activeHook.isConfirming, activeHook.isConfirmed]);

    // Show toast on success
    React.useEffect(() => {
        if (activeHook.isConfirmed && activeHook.txHash) {
            const transactionType = isTokenInitialized ? 'DEPOSIT' : 'INITIALIZE';
            toast(`${transactionType} TRANSACTION CONFIRMED`, 'success');
        }
    }, [activeHook.isConfirmed, activeHook.txHash, toast, isTokenInitialized]);

    // Show modal on error
    React.useEffect(() => {
        if (activeHook.txError) {
            setShowTransactionModal(true);
        }
    }, [activeHook.txError]);

    // Format balance for display
    const formatBalance = (balance: bigint | null, decimals: number | null): string => {
        if (balance === null || decimals === null) return '0';
        const divisor = BigInt(10 ** decimals);
        const integerPart = balance / divisor;
        const decimalPart = balance % divisor;
        const decimalStr = decimalPart.toString().padStart(decimals, '0');
        const decimalStrTrimmed = decimalStr.replace(/0+$/, '');
        return decimalStrTrimmed === '' ? integerPart.toString() : `${integerPart.toString()}.${decimalStrTrimmed}`;
    };

    // Format allowance for display
    const formatAllowance = (allowance: bigint | null, decimals: number | null): string => {
        if (allowance === null || decimals === null) return '0';
        return formatBalance(allowance, decimals);
    };

    // Get amount from active hook
    const amount = activeHook.amount || '';
    const setAmount = activeHook.setAmount || (() => {});
    const tokenBalance = activeHook.tokenBalance || null;
    const isLoadingBalance = activeHook.isLoadingBalance || false;
    const allowance = activeHook.allowance || null;
    const isCheckingAllowance = activeHook.isCheckingAllowance || false;
    const isApproving = activeHook.isApproving || false;
    const isApprovalPending = activeHook.isApprovalPending || false;
    const isApprovalConfirming = activeHook.isApprovalConfirming || false;
    const isApprovalConfirmed = activeHook.isApprovalConfirmed || false;
    const handleApprove = activeHook.handleApprove || (() => {});

    // Check if amount is valid
    const isValidAmount = React.useMemo(() => {
        if (!amount || !tokenAddress) return false;
        const sanitized = amount.trim();
        if (!sanitized || sanitized === '') return false;
        if (!/^\d+\.?\d*$/.test(sanitized)) return false;
        const parts = sanitized.split('.');
        const integerPart = parts[0] || '0';
        const decimalPart = parts[1] || '';
        return integerPart !== '0' || decimalPart.replace(/0/g, '') !== '';
    }, [amount, tokenAddress]);

    // Calculate required amount for allowance check
    const requiredAmount = React.useMemo(() => {
        if (!amount || amount === '' || !tokenDecimals) return BigInt(0);
        const sanitizedAmount = amount.trim();
        const parts = sanitizedAmount.split('.');
        const finalDecimals = tokenDecimals;
        if (parts.length === 1) {
            return BigInt(sanitizedAmount) * BigInt(10 ** finalDecimals);
        } else {
            const integerPart = parts[0] || '0';
            const decimalPart = parts[1] || '';
            const limitedDecimal = decimalPart.slice(0, finalDecimals);
            const paddedDecimal = limitedDecimal.padEnd(finalDecimals, '0');
            return BigInt(integerPart) * BigInt(10 ** finalDecimals) + BigInt(paddedDecimal);
        }
    }, [amount, tokenDecimals]);

    const needsApproval = allowance !== null && allowance < requiredAmount && requiredAmount > BigInt(0);

    // Determine if we're in initialize or deposit mode
    const isDepositMode = isTokenInitialized === true && tokenCurrentNonce !== null && tokenCurrentNonce > BigInt(0);
    const isInitializeMode = !isDepositMode;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden relative">
            {/* Subtle ambient glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[600px] pointer-events-none overflow-hidden"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(167, 139, 250, 0.06) 0%, transparent 60%)"
                }}
            />

            <div className="max-w-2xl mx-auto relative z-10 w-full">
                {/* Section header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/40" />
                        <span className="text-primary/50 text-sm">◈</span>
                        <span className="font-mono text-sm md:text-base text-muted-foreground tracking-[0.2em] uppercase">
                            {isDepositMode ? 'Deposit Ritual' : 'The First Incantation'}
                        </span>
                        <span className="text-primary/50 text-sm">◈</span>
                        <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40" />
                    </div>
                    <h1 className="font-sans text-2xl md:text-3xl lg:text-4xl text-foreground tracking-wider mb-4">
                        RITUALS
                    </h1>
                    <p className="font-mono text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        {isDepositMode
                            ? 'Add funds to your private account in the Arkana network.'
                            : 'Initialize your first position in the Arkana network. This ritual creates your initial commitment in the void.'}
                        {isCheckingTokenState && tokenAddress && (
                            <span className="block mt-2 text-xs">Checking token state...</span>
                        )}
                        {!isCheckingTokenState && tokenAddress && isTokenInitialized !== null && (
                            <span className={`block mt-2 text-xs ${isDepositMode ? 'text-accent' : 'text-yellow-400'}`}>
                                {isDepositMode ? `✓ Token initialized - Deposit mode (Nonce: ${tokenCurrentNonce?.toString() || 'N/A'})` : '⚠ Token not initialized - Initialize mode'}
                            </span>
                        )}
                    </p>
                </div>

                {/* Main Card */}
                <div className="relative group w-full min-w-0">
                    {/* Corner sigils */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t border-l border-primary/30 transition-all duration-500" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t border-r border-primary/30 transition-all duration-500" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b border-l border-primary/30 transition-all duration-500" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b border-r border-primary/30 transition-all duration-500" />

                    {/* Ethereal border */}
                    <div 
                        className="absolute inset-0 border border-primary/10 transition-all duration-700"
                        style={{
                            boxShadow: "0 0 20px rgba(139, 92, 246, 0.1)"
                        }}
                    />

                    <Card className="relative bg-card/60 backdrop-blur-sm border-0 w-full min-w-0">
                        <CardHeader className="border-b border-border/30 bg-card/40 py-4 px-4 sm:px-6 mb-4">
                            <div className="flex items-center gap-3 justify-center mb-2">
                                <span className="text-primary/60 text-sm">✧</span>
                                <CardTitle className="text-center text-base sm:text-xl font-sans tracking-wider uppercase" style={{ textShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}>
                                    {isDepositMode ? 'DEPOSIT' : 'INITIALIZE'}
                                </CardTitle>
                                <span className="text-primary/60 text-sm">✧</span>
                            </div>
                            <CardDescription className="text-center text-xs sm:text-sm font-mono text-muted-foreground tracking-wider">
                                {isDepositMode ? 'ADD FUNDS TO YOUR PRIVATE ACCOUNT' : 'CREATE YOUR FIRST POSITION IN THE VOID'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 w-full">
                            <div className="space-y-4 w-full">
                                {/* Sign message button */}
                                {!zkAddress && (
                                    <SpellButton
                                        onClick={handleSign}
                                        disabled={activeHook.isLoading || isSigning}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        {activeHook.isLoading || isSigning ? 'SIGNING...' : 'SIGN MESSAGE FOR ARKANA NETWORK ACCESS'}
                                    </SpellButton>
                                )}

                                {/* Error message */}
                                {activeHook.error && (
                                    <div className="relative border border-destructive/30 bg-card/40 backdrop-blur-sm p-4 rounded-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-destructive/60 text-sm">✗</span>
                                            <p className="text-sm font-mono text-destructive uppercase tracking-wider">{activeHook.error}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Form - Show if zkAddress exists */}
                                {zkAddress && (
                                    <div className="relative group w-full min-w-0">
                                        {/* Corner sigils */}
                                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-primary/30" />
                                        <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-primary/30" />
                                        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-primary/30" />
                                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-primary/30" />

                                        <Card className="relative border border-primary/10 bg-card/40 backdrop-blur-sm border-0 w-full min-w-0">
                                            <CardHeader className="border-b border-border/30 bg-card/30 py-3 px-4 sm:px-5 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-primary/60 text-xs">◈</span>
                                                    <CardTitle className="text-xs sm:text-sm font-sans uppercase tracking-wider">
                                                        {isDepositMode ? 'DEPOSIT DETAILS' : 'INITIALIZE DETAILS'}
                                                    </CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {/* Token Address Input */}
                                                    <div className="w-full">
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1 sm:mb-2">
                                                            <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider">
                                                                TOKEN ADDRESS
                                                            </label>
                                                            <Button
                                                                type="button"
                                                                onClick={() => setShowTokenSelector(true)}
                                                                className="text-xs px-3 py-1.5 h-auto bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50 font-mono uppercase transition-all duration-300 whitespace-nowrap shrink-0"
                                                                style={{ boxShadow: "0 0 10px rgba(0, 255, 136, 0.1)" }}
                                                            >
                                                                {isLoadingTokens ? 'LOADING...' : `SELECT FROM AAVE (${aaveTokens.length})`}
                                                            </Button>
                                                        </div>

                                                        <Input
                                                            type="text"
                                                            value={tokenAddress}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                const normalized = value.toLowerCase();
                                                                setTokenAddress(normalized);
                                                            }}
                                                            placeholder="0x..."
                                                            className="text-xs sm:text-sm w-full"
                                                        />
                                                    </div>

                                                    {/* Amount Input */}
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider mb-1 sm:mb-2">
                                                            {isDepositMode ? 'DEPOSIT' : 'INITIALIZE'} AMOUNT {tokenDecimals !== null ? `(${tokenDecimals} decimals)` : ''}
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="text"
                                                                value={amount}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === '') {
                                                                        setAmount('');
                                                                        return;
                                                                    }
                                                                    const normalizedValue = value.replace(',', '.');
                                                                    if (tokenDecimals !== null && tokenDecimals >= 0) {
                                                                        const parts = normalizedValue.split('.');
                                                                        if (parts.length === 1) {
                                                                            if (/^\d+$/.test(parts[0]) || parts[0] === '') {
                                                                                setAmount(normalizedValue);
                                                                            }
                                                                        } else if (parts.length === 2) {
                                                                            const integerPart = parts[0];
                                                                            const decimalPart = parts[1];
                                                                            if ((integerPart === '' || /^\d+$/.test(integerPart)) &&
                                                                                (decimalPart === '' || /^\d+$/.test(decimalPart))) {
                                                                                if (decimalPart.length <= tokenDecimals) {
                                                                                    setAmount(normalizedValue);
                                                                                } else {
                                                                                    const truncatedDecimal = decimalPart.slice(0, tokenDecimals);
                                                                                    setAmount(integerPart + '.' + truncatedDecimal);
                                                                                }
                                                                            }
                                                                        }
                                                                    } else {
                                                                        if (/^\d*\.?\d*$/.test(normalizedValue)) {
                                                                            setAmount(normalizedValue);
                                                                        }
                                                                    }
                                                                }}
                                                                placeholder={
                                                                    tokenDecimals !== null
                                                                        ? `e.g., 1.5 (max ${tokenDecimals} decimals)`
                                                                        : "Enter amount (supports . or , as decimal separator)"
                                                                }
                                                                className="text-xs sm:text-sm flex-1"
                                                            />
                                                            <Button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (tokenBalance !== null && tokenDecimals !== null) {
                                                                        setAmount(formatBalance(tokenBalance, tokenDecimals));
                                                                    }
                                                                }}
                                                                disabled={tokenBalance === null || tokenDecimals === null || isLoadingBalance}
                                                                className="text-xs px-3 py-2 h-auto bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50 font-mono uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                style={{ boxShadow: "0 0 10px rgba(0, 255, 136, 0.1)" }}
                                                            >
                                                                MAX
                                                            </Button>
                                                        </div>
                                                        {tokenBalance !== null && tokenDecimals !== null && (
                                                            <p className="text-[10px] font-mono text-muted-foreground mt-1 text-right">
                                                                Balance: {formatBalance(tokenBalance, tokenDecimals)} {isLoadingBalance && <span className="text-muted-foreground/60">(loading...)</span>}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Lock Duration Input - Only for Initialize */}
                                                    {isInitializeMode && initializeHook.lockDuration !== undefined && (
                                                        <div>
                                                            <label htmlFor="lockDuration" className="block text-xs sm:text-sm font-sans font-bold text-foreground mb-1 sm:mb-2 uppercase tracking-wider">
                                                                LOCK DURATION (SECONDS)
                                                            </label>
                                                            <Input
                                                                type="text"
                                                                id="lockDuration"
                                                                value={initializeHook.lockDuration || ''}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === '' || /^\d+$/.test(value)) {
                                                                        initializeHook.setLockDuration(value);
                                                                    }
                                                                }}
                                                                placeholder="0 (for normal users) or lock duration in seconds"
                                                                className="text-xs sm:text-sm bg-card/40 border-border/50 text-foreground font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Current Nonce Display - Only for Deposit */}
                                                    {isDepositMode && tokenCurrentNonce !== null && (
                                                        <div className="relative border border-primary/20 bg-card/40 backdrop-blur-sm p-3 sm:p-4 rounded-sm">
                                                            <div className="space-y-1">
                                                                <p className="text-xs sm:text-sm font-mono text-foreground">
                                                                    NEXT NONCE: <span className="font-bold break-all text-primary" style={{ textShadow: "0 0 8px rgba(139, 92, 246, 0.3)" }}>{tokenCurrentNonce.toString()}</span>
                                                                </p>
                                                                <p className="text-[10px] sm:text-xs font-mono text-muted-foreground uppercase break-words tracking-wider">
                                                                    USING PREV NONCE {(tokenCurrentNonce > BigInt(0) ? (tokenCurrentNonce - BigInt(1)) : BigInt(0)).toString()} → CREATE {tokenCurrentNonce.toString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Token Approval Section */}
                                                    {isValidAmount && (
                                                        <div className="mt-2 sm:mt-3 relative border border-border/30 bg-card/40 backdrop-blur-sm p-3 sm:pt-4 rounded-sm">
                                                            {isCheckingAllowance ? (
                                                                <p className="text-xs sm:text-sm font-mono text-foreground uppercase tracking-wider">CHECKING ALLOWANCE...</p>
                                                            ) : allowance !== null ? (
                                                                <>
                                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 mb-2">
                                                                        <span className="text-xs sm:text-sm font-mono text-muted-foreground uppercase tracking-wider">ALLOWANCE:</span>
                                                                        <span className="text-xs sm:text-sm font-mono text-foreground">
                                                                            {formatAllowance(allowance, tokenDecimals)} / {amount || '0'}
                                                                        </span>
                                                                    </div>
                                                                    {needsApproval ? (
                                                                        <>
                                                                            <p className="text-xs sm:text-sm font-mono text-foreground uppercase mb-2 tracking-wider">
                                                                                INSUFFICIENT ALLOWANCE. APPROVE TOKEN FIRST.
                                                                            </p>
                                                                            <SpellButton
                                                                                onClick={handleApprove}
                                                                                disabled={isApprovalPending || isApprovalConfirming}
                                                                                variant="primary"
                                                                                className="w-full text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                {isApprovalPending
                                                                                    ? 'APPROVING...'
                                                                                    : isApprovalConfirming
                                                                                        ? 'CONFIRMING APPROVAL...'
                                                                                        : isApprovalConfirmed
                                                                                            ? 'APPROVED ✓'
                                                                                            : 'APPROVE TOKEN'}
                                                                            </SpellButton>
                                                                        </>
                                                                    ) : (
                                                                        <p className="text-xs sm:text-sm font-mono text-accent uppercase tracking-wider" style={{ textShadow: "0 0 8px rgba(0, 255, 136, 0.3)" }}>
                                                                            ✓ ALLOWANCE SUFFICIENT
                                                                        </p>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <p className="text-xs sm:text-sm font-mono text-muted-foreground uppercase tracking-wider">
                                                                    UNABLE TO CHECK ALLOWANCE
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Generate Proof / Send Transaction Button */}
                                                    <SpellButton
                                                        onClick={activeHook.proof ? (isDepositMode ? depositHook.handleDeposit : initializeHook.handleInitCommit) : (isDepositMode ? depositHook.proveDeposit : initializeHook.proveArkanaEntry)}
                                                        disabled={Boolean(
                                                            activeHook.proof
                                                                ? activeHook.isPending || activeHook.isConfirming || activeHook.isSubmitting || !activeHook.proof || !activeHook.publicInputs?.length || needsApproval || (isDepositMode && depositHook.isSimulating)
                                                                : activeHook.isProving || activeHook.isInitializing || !tokenAddress || !amount || (isDepositMode && (depositHook.isCalculatingInputs || depositHook.isTokenInitialized === false || (depositHook.isTokenInitialized === true && depositHook.tokenCurrentNonce === null)))
                                                        )}
                                                        variant="primary"
                                                        className="w-full text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {activeHook.proof
                                                            ? isDepositMode && depositHook.isSimulating
                                                                ? 'SIMULATING TRANSACTION...'
                                                                : activeHook.isPending || activeHook.isSubmitting
                                                                    ? 'PREPARING TRANSACTION...'
                                                                    : activeHook.isConfirming
                                                                        ? 'CONFIRMING TRANSACTION...'
                                                                        : needsApproval
                                                                            ? 'APPROVE TOKEN FIRST'
                                                                            : isDepositMode
                                                                                ? 'DEPOSIT ON ARKANA CONTRACT'
                                                                                : 'INITIALIZE ON ARKANA CONTRACT'
                                                            : activeHook.isProving
                                                                ? `GENERATING PROOF... (${activeHook.currentProvingTime || 0}MS)`
                                                                : activeHook.isInitializing
                                                                    ? 'INITIALIZING BACKEND...'
                                                                    : isDepositMode
                                                                        ? (depositHook.isCalculatingInputs ? 'CALCULATING INPUTS...' : depositHook.isTokenInitialized === false ? 'TOKEN NOT INITIALIZED' : 'GENERATE DEPOSIT PROOF')
                                                                        : 'GENERATE INITIALIZE PROOF'}
                                                    </SpellButton>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* Proof Error */}
                                {activeHook.proofError && (
                                    <div className="relative border border-destructive/30 bg-card/40 backdrop-blur-sm p-4 rounded-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-destructive/60 text-sm">✗</span>
                                            <p className="text-sm font-mono text-destructive uppercase tracking-wider">{activeHook.proofError}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Transaction Status */}
                                {activeHook.txHash && (
                                    <div className="mt-2 sm:mt-3 relative border border-primary/20 bg-card/40 backdrop-blur-sm p-3 sm:p-4 rounded-sm">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
                                            <span className="text-xs sm:text-sm font-mono text-muted-foreground uppercase tracking-wider">TX HASH:</span>
                                            <a
                                                href={`#`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs sm:text-sm font-mono text-primary hover:text-primary/70 underline break-all transition-colors"
                                                style={{ textShadow: "0 0 5px rgba(139, 92, 246, 0.3)" }}
                                            >
                                                {activeHook.txHash.slice(0, 12)}...{activeHook.txHash.slice(-6)}
                                            </a>
                                        </div>
                                        {activeHook.isConfirming && (
                                            <p className="text-[10px] sm:text-xs font-mono text-muted-foreground mt-1 uppercase tracking-wider">
                                                WAITING FOR CONFIRMATION...
                                            </p>
                                        )}
                                        {activeHook.isConfirmed && (
                                            <p className="text-[10px] sm:text-xs font-mono text-accent font-bold mt-1 uppercase tracking-wider" style={{ textShadow: "0 0 8px rgba(0, 255, 136, 0.3)" }}>
                                                [CONFIRMED]
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Proving Time */}
                                {activeHook.provingTime !== null && (
                                    <div className="text-center">
                                        <p className="text-xs font-mono text-muted-foreground">
                                            Proof generated in <span className="text-primary">{activeHook.provingTime}ms</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Decorative divider */}
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
                isProving={activeHook.isProving || false}
                isPending={activeHook.isPending || activeHook.isSubmitting || false}
                isConfirming={activeHook.isConfirming || false}
                isConfirmed={activeHook.isConfirmed || false}
                txHash={activeHook.txHash || null}
                error={activeHook.txError || activeHook.proofError || null}
                transactionType={isDepositMode ? "DEPOSIT" : "INITIALIZE"}
            />

            {/* Token Selector Modal */}
            <Dialog open={showTokenSelector} onOpenChange={setShowTokenSelector}>
                <DialogContent className="max-w-xl max-h-[80vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-sm border-primary/30 mx-auto">
                    <DialogHeader className="pb-3">
                        <DialogTitle className="text-center text-sm sm:text-base font-sans tracking-wider uppercase" style={{ textShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}>
                            SELECT TOKEN
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto mt-2">
                        {isLoadingTokens ? (
                            <p className="text-[10px] font-mono text-muted-foreground text-center py-6">Loading Aave tokens...</p>
                        ) : aaveTokens.length === 0 ? (
                            <p className="text-[10px] font-mono text-muted-foreground text-center py-6">No Aave tokens available</p>
                        ) : (
                            <div className="space-y-1 pr-1">
                                {aaveTokens.map((token) => (
                                    <button
                                        key={token.address}
                                        type="button"
                                        onClick={() => {
                                            setTokenAddress(token.address.toLowerCase());
                                            setShowTokenSelector(false);
                                        }}
                                        className="w-full text-left px-3 py-2 hover:bg-secondary/50 border border-transparent hover:border-accent/30 rounded transition-all duration-300"
                                        style={{
                                            boxShadow: "0 0 0 0 rgba(0, 255, 136, 0)",
                                            transition: "all 0.3s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = "0 0 8px rgba(0, 255, 136, 0.15)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = "0 0 0 0 rgba(0, 255, 136, 0)";
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <TokenIcon symbol={token.symbol} size={20} />
                                                <div>
                                                    <p className="text-xs font-mono text-foreground font-bold">${token.symbol}</p>
                                                    <p className="text-[10px] font-mono text-muted-foreground">${token.name} ({token.decimals} decimals)</p>
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-mono text-accent">{token.address.slice(0, 6)}...{token.address.slice(-4)}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

