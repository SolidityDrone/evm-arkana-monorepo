'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    isPending?: boolean;
    isConfirming?: boolean;
    isConfirmed?: boolean;
    isProving?: boolean;
    txHash: string | null;
    error: string | null;
    transactionType?: string;
    onConfirmed?: () => void;
}

// Arcane mystical dots animation
function ArcaneDots() {
    return (
        <div className="flex items-center justify-center space-x-2 py-4">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="text-primary font-mono text-2xl font-bold"
                    style={{
                        animation: `arcane-pulse 1.5s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`,
                    }}
                >
                    ✧
                </span>
            ))}
        </div>
    );
}

// Typing animation component with arcane styling
function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
    const [displayedText, setDisplayedText] = useState('');
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        setDisplayedText('');
        let currentIndex = 0;
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayedText(text.slice(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    clearInterval(interval);
                }
            }, 30);
            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timeout);
    }, [text, delay]);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 530);
        return () => clearInterval(cursorInterval);
    }, []);

    return (
        <span className="font-mono inline-flex items-center" style={{ textShadow: '0 0 10px rgba(139, 92, 246, 0.5)' }}>
            <span className="inline-block">{displayedText}</span>
            <span className="inline-block w-3 text-center text-primary">
                {showCursor ? '▊' : ' '}
            </span>
        </span>
    );
}

export default function TransactionModal({
    isOpen,
    onClose,
    isPending = false,
    isConfirming = false,
    isConfirmed = false,
    isProving = false,
    txHash,
    error,
    transactionType = 'TRANSACTION',
    onConfirmed
}: TransactionModalProps) {
    const [mounted, setMounted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [elapsedMs, setElapsedMs] = useState(0);
    const [progress, setProgress] = useState(0);
    const [proofComplete, setProofComplete] = useState(false);
    const startTimeRef = useRef<number | null>(null);
    const prevIsProvingRef = useRef<boolean>(false);
    const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasSetFadeOutRef = useRef<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Animate modal entrance
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setShowModal(true), 10);
        } else {
            setShowModal(false);
        }
    }, [isOpen]);

    // Track elapsed time and progress during proof generation
    useEffect(() => {
        const wasProving = prevIsProvingRef.current;
        prevIsProvingRef.current = isProving;

        if (isProving && isOpen) {
            if (!wasProving) {
                if (fadeTimerRef.current) {
                    clearTimeout(fadeTimerRef.current);
                    fadeTimerRef.current = null;
                }
                hasSetFadeOutRef.current = false;
                setProofComplete(false);
                setElapsedMs(0);
                setProgress(0);
                startTimeRef.current = performance.now();
            }

            if (!startTimeRef.current) {
                startTimeRef.current = performance.now();
            }

            const interval = setInterval(() => {
                if (startTimeRef.current) {
                    const elapsed = Math.round(performance.now() - startTimeRef.current);
                    setElapsedMs(elapsed);

                    let averageTime = 15000;
                    if (transactionType === 'DEPOSIT' || transactionType === 'WITHDRAW') {
                        averageTime = 6000;
                    } else if (transactionType === 'ABSORB' || transactionType === 'SEND') {
                        averageTime = 10000;
                    } else if (transactionType === 'INITIALIZE') {
                        averageTime = 5000;
                    }

                    const calculatedProgress = Math.min((elapsed / averageTime) * 90, 90);
                    setProgress(calculatedProgress);
                }
            }, 50);

            return () => clearInterval(interval);
        } else if (!isProving && wasProving && startTimeRef.current && !proofComplete && isOpen && !hasSetFadeOutRef.current) {
            const finalElapsed = Math.round(performance.now() - (startTimeRef.current || 0));
            setElapsedMs(finalElapsed);

            hasSetFadeOutRef.current = true;
            setProofComplete(true);

            setTimeout(() => {
                setProgress(100);
            }, 10);

            fadeTimerRef.current = setTimeout(() => {
                onClose();
            }, 1500);
        } else if (proofComplete && startTimeRef.current && isOpen) {
            const finalElapsed = Math.round(performance.now() - (startTimeRef.current || 0));
            setElapsedMs(finalElapsed);
        }
    }, [isProving, isOpen, proofComplete, onClose, transactionType]);

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            setElapsedMs(0);
            setProgress(0);
            setProofComplete(false);
            setShowSuccess(false);
            setShowDetails(false);
            startTimeRef.current = null;
            prevIsProvingRef.current = false;
            hasSetFadeOutRef.current = false;
            if (fadeTimerRef.current) {
                clearTimeout(fadeTimerRef.current);
                fadeTimerRef.current = null;
            }
        }
    }, [isOpen]);

    const hasCalledOnConfirmedRef = useRef(false);

    useEffect(() => {
        if (isConfirmed && isOpen && !isProving) {
            setShowSuccess(true);
            if (onConfirmed && !hasCalledOnConfirmedRef.current) {
                hasCalledOnConfirmedRef.current = true;
                const timer = setTimeout(() => {
                    try {
                        onConfirmed();
                    } catch (error) {
                        console.error('Error calling onConfirmed:', error);
                    }
                }, 2000);
                return () => clearTimeout(timer);
            }
        } else {
            setShowSuccess(false);
        }
    }, [isConfirmed, isOpen, isProving, onConfirmed]);

    useEffect(() => {
        if (!isOpen || isProving) {
            hasCalledOnConfirmedRef.current = false;
        }
    }, [isOpen, isProving]);

    if (!isOpen || !mounted) return null;

    const isLoading = (isPending || isConfirming || isProving || proofComplete) && !isConfirmed;
    const showError = error && !isLoading && !isConfirmed && !proofComplete;
    const canClose = !isProving && !isPending && !isConfirming && !proofComplete;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-500 ${showModal ? 'opacity-95' : 'opacity-0'}`}
                onClick={canClose ? onClose : undefined}
                style={{ 
                    cursor: canClose ? 'pointer' : 'default',
                }}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
                <div
                    className={`relative max-w-lg w-full transition-all duration-500 ${showModal
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 translate-y-4'
                        }`}
                >
                    {/* Corner sigils */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-primary/50" style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)' }} />
                    <div className="absolute -top-2 -right-2 w-4 h-4 border-t border-r border-primary/50" style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)' }} />
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b border-l border-primary/50" style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)' }} />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-primary/50" style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)' }} />

                    {/* Ethereal border glow */}
                    <div className="absolute inset-0 border border-primary/30 rounded-sm" style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.2), inset 0 0 30px rgba(139, 92, 246, 0.1)' }} />

                    <Card className="border-0 bg-card/90 backdrop-blur-md relative overflow-hidden">
                        {/* Animated background pattern */}
                        <div 
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='arcane' x='0' y='0' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0,30 L60,30 M30,0 L30,60' stroke='rgba(139,92,246,0.3)' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='2' fill='rgba(139,92,246,0.2)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23arcane)'/%3E%3C/svg%3E")`,
                                backgroundSize: '60px 60px',
                            }}
                        />

                        <CardContent className="p-4 sm:p-6 relative z-10">
                            {isLoading && (
                                <div className="space-y-4 text-center">
                                    {/* Arcane Dots */}
                                    <ArcaneDots />

                                    {/* Status Text */}
                                    <div className="space-y-2">
                                        <p className="text-sm sm:text-base font-mono text-primary uppercase font-bold tracking-wider">
                                            <TypingText
                                                text={
                                                    proofComplete
                                                        ? 'PROOF COMPLETE'
                                                        : isProving
                                                            ? 'GENERATING PROOF'
                                                            : isPending
                                                                ? 'WAITING FOR SIGNATURE'
                                                                : 'CONFIRMING TRANSACTION'
                                                }
                                                delay={200}
                                            />
                                        </p>
                                        <p className="text-[10px] sm:text-xs font-mono text-muted-foreground uppercase tracking-wider">
                                            {proofComplete
                                                ? 'FINALIZING...'
                                                : isProving
                                                    ? 'COMPUTING ZERO-KNOWLEDGE PROOF'
                                                    : isPending
                                                        ? 'PLEASE CHECK YOUR WALLET'
                                                        : 'WAITING FOR BLOCKCHAIN CONFIRMATION'}
                                        </p>
                                    </div>

                                    {/* Arcane Progress Bar */}
                                    <div className="space-y-2 mt-4">
                                        <div className="w-full bg-card/60 border border-primary/20 h-5 overflow-hidden relative rounded-sm">
                                            {/* Animated shimmer effect */}
                                            <div 
                                                className="absolute inset-0 opacity-30"
                                                style={{
                                                    background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.5) 50%, transparent 100%)',
                                                    animation: 'shimmer 2s infinite',
                                                }}
                                            />
                                            
                                            {/* Progress fill with arcane pattern */}
                                            <div
                                                className="h-full relative overflow-hidden"
                                                style={{
                                                    width: proofComplete
                                                        ? `${progress}%`
                                                        : isProving
                                                            ? `${progress}%`
                                                            : isPending
                                                                ? '40%'
                                                                : '80%',
                                                    transition: proofComplete
                                                        ? 'width 1s ease-out'
                                                        : isProving
                                                            ? 'width 0.3s linear'
                                                            : 'width 0.5s ease-in-out',
                                                }}
                                            >
                                                {/* Arcane energy pattern */}
                                                <div
                                                    className="absolute inset-0"
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(168, 85, 247, 0.6) 50%, rgba(139, 92, 246, 0.8) 100%)',
                                                        backgroundSize: '20px 20px',
                                                        animation: 'arcane-flow 3s linear infinite',
                                                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.5), inset 0 0 10px rgba(139, 92, 246, 0.3)',
                                                    }}
                                                />
                                                
                                                {/* Rune pattern overlay */}
                                                <div
                                                    className="absolute inset-0 opacity-20"
                                                    style={{
                                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='20' y='25' font-family='monospace' font-size='20' fill='rgba(139,92,246,0.5)' text-anchor='middle'%3E✧%3C/text%3E%3C/svg%3E")`,
                                                        backgroundSize: '40px 40px',
                                                        animation: 'float 4s ease-in-out infinite',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        
                                        {(isProving || proofComplete) && (
                                            <p className="text-[10px] sm:text-xs font-mono text-primary uppercase tracking-wider" style={{ textShadow: '0 0 8px rgba(139, 92, 246, 0.4)' }}>
                                                {elapsedMs.toLocaleString()} MS
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {showSuccess && (
                                <div className="space-y-4 text-center animate-fadeIn">
                                    {/* Success Message */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-center space-x-3">
                                            <span 
                                                className="text-primary font-mono text-3xl animate-bounce-slow"
                                                style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.8)' }}
                                            >
                                                ✧
                                            </span>
                                            <span className="text-foreground font-mono text-base uppercase font-bold tracking-wider" style={{ textShadow: '0 0 10px rgba(139, 92, 246, 0.3)' }}>
                                                TRANSACTION CONFIRMED
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm font-mono text-muted-foreground uppercase tracking-wider">
                                            BLOCKCHAIN VERIFIED
                                        </p>
                                    </div>

                                    {/* Collapsible Transaction Details */}
                                    {txHash && (
                                        <div className="mt-4">
                                            <button
                                                onClick={() => setShowDetails(!showDetails)}
                                                className="w-full flex items-center justify-between p-3 bg-card/60 border border-primary/30 hover:border-primary/60 transition-all duration-300 rounded-sm"
                                                style={{ 
                                                    boxShadow: showDetails ? '0 0 15px rgba(139, 92, 246, 0.2)' : 'none'
                                                }}
                                            >
                                                <span className="text-xs sm:text-sm font-mono text-foreground uppercase tracking-wider">
                                                    TRANSACTION DETAILS
                                                </span>
                                                <span className="text-primary font-mono text-sm">
                                                    {showDetails ? '▲' : '▼'}
                                                </span>
                                            </button>
                                            {showDetails && (
                                                <div className="mt-2 p-4 bg-card/60 border border-primary/30 space-y-2 animate-fadeIn rounded-sm" style={{ boxShadow: '0 0 15px rgba(139, 92, 246, 0.1)' }}>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
                                                        <span className="text-xs sm:text-sm font-mono text-muted-foreground uppercase tracking-wider">TX HASH:</span>
                                                        <a
                                                            href={`#`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs sm:text-sm font-mono text-primary hover:text-primary/70 underline break-all transition-colors"
                                                            style={{ textShadow: '0 0 5px rgba(139, 92, 246, 0.3)' }}
                                                        >
                                                            {txHash.slice(0, 12)}...{txHash.slice(-6)}
                                                        </a>
                                                    </div>
                                                    <p className="text-[10px] font-mono text-muted-foreground mt-2">
                                                        CLICK TO VIEW ON BASESCAN
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        onClick={onClose}
                                        className="w-full mt-4 bg-primary/90 hover:bg-primary text-primary-foreground font-mono font-bold uppercase tracking-wider transition-all duration-300"
                                        style={{ 
                                            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
                                        }}
                                    >
                                        CLOSE
                                    </Button>
                                </div>
                            )}

                            {showError && (
                                <div className="space-y-4 text-center animate-fadeIn">
                                    {/* Error Message */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-center space-x-3">
                                            <span className="text-destructive font-mono text-3xl" style={{ textShadow: '0 0 15px rgba(239, 68, 68, 0.5)' }}>
                                                ✗
                                            </span>
                                            <span className="text-foreground font-mono text-base uppercase font-bold tracking-wider">
                                                TRANSACTION FAILED
                                            </span>
                                        </div>
                                        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-sm" style={{ boxShadow: '0 0 15px rgba(239, 68, 68, 0.1)' }}>
                                            <p className="text-xs sm:text-sm font-mono text-destructive uppercase tracking-wider">
                                                {error?.includes('Simulation') || error?.includes('simulation')
                                                    ? 'SIMULATION ERRORED: CHECK CONSOLE FOR MORE INFORMATIONS'
                                                    : 'TRANSACTION FAILED: CHECK CONSOLE FOR MORE INFORMATIONS'}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={onClose}
                                        className="w-full mt-6 border-destructive/50 text-destructive hover:bg-destructive/10 font-mono uppercase tracking-wider transition-all duration-300"
                                        variant="outline"
                                    >
                                        CLOSE
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

