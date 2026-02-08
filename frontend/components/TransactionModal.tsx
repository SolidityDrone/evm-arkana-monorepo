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

// Mystical Ritual Circle Loader - matching homepage style
function RitualLoader({ progress = 0, isComplete = false }: { progress?: number; isComplete?: boolean }) {
    // Elder Futhark runes for the outer ring
    const outerRunes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'];
    // Inner cardinal runes
    const cardinalRunes = ['ᚠ', 'ᚦ', 'ᚨ', 'ᚱ'];
    
    return (
        <div className="relative w-40 h-40 mx-auto">
            {/* Outer ethereal glow */}
            <div 
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                    animationDuration: '2s',
                }}
            />
            
            {/* Main SVG Ritual Circle */}
            <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                style={{ 
                    animation: 'spin 30s linear infinite',
                    filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))',
                }}
            >
                {/* Outermost ethereal ring */}
                <circle
                    cx="100"
                    cy="100"
                    r="95"
                    fill="none"
                    stroke="rgba(168, 85, 247, 0.9)"
                    strokeWidth="1.5"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.5))' }}
                />
                
                {/* Outer dashed ring */}
                <circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke="rgba(168, 85, 247, 0.7)"
                    strokeWidth="1"
                    strokeDasharray="12 6 3 6"
                />
                
                {/* Runes ring */}
                <g>
                    {outerRunes.map((rune, i) => {
                        const angle = (i * 30 - 90) * Math.PI / 180;
                        const radius = 78;
                        const x = 100 + radius * Math.cos(angle);
                        const y = 100 + radius * Math.sin(angle);
                        const rotation = (i * 30);
                        
                        return (
                            <text
                                key={i}
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="rgb(168, 85, 247)"
                                transform={`rotate(${rotation} ${x} ${y})`}
                                style={{
                                    fontSize: '12px',
                                    fontFamily: 'monospace',
                                    stroke: 'rgba(255, 240, 255, 0.6)',
                                    strokeWidth: '0.3px',
                                    paintOrder: 'stroke fill',
                                }}
                            >
                                {rune}
                            </text>
                        );
                    })}
                </g>
                
                {/* Middle ring */}
                <circle
                    cx="100"
                    cy="100"
                    r="65"
                    fill="none"
                    stroke="rgba(168, 85, 247, 0.8)"
                    strokeWidth="1.5"
                />
                
                {/* Pentagram */}
                {(() => {
                    const centerX = 100;
                    const centerY = 100;
                    const outerRadius = 55;
                    const innerRadius = outerRadius * 0.382;
                    
                    const points = [];
                    for (let i = 0; i < 10; i++) {
                        const angle = (i * 36 - 90) * Math.PI / 180;
                        const radius = i % 2 === 0 ? outerRadius : innerRadius;
                        const x = centerX + radius * Math.cos(angle);
                        const y = centerY + radius * Math.sin(angle);
                        points.push(`${x},${y}`);
                    }
                    return (
                        <polygon
                            points={points.join(' ')}
                            fill="none"
                            stroke="rgba(168, 85, 247, 0.75)"
                            strokeWidth="1"
                            style={{ filter: 'drop-shadow(0 0 3px rgba(168, 85, 247, 0.4))' }}
                        />
                    );
                })()}
                
                {/* Inner pentagram */}
                {(() => {
                    const centerX = 100;
                    const centerY = 100;
                    const outerRadius = 40;
                    const innerRadius = outerRadius * 0.382;
                    
                    const points = [];
                    for (let i = 0; i < 10; i++) {
                        const angle = (i * 36 - 90) * Math.PI / 180;
                        const radius = i % 2 === 0 ? outerRadius : innerRadius;
                        const x = centerX + radius * Math.cos(angle);
                        const y = centerY + radius * Math.sin(angle);
                        points.push(`${x},${y}`);
                    }
                    return (
                        <polygon
                            points={points.join(' ')}
                            fill="none"
                            stroke="rgba(168, 85, 247, 0.6)"
                            strokeWidth="0.8"
                        />
                    );
                })()}
                
                {/* Progress arc - fills as proof generates */}
                {progress > 0 && (
                    <circle
                        cx="100"
                        cy="100"
                        r="95"
                        fill="none"
                        stroke="rgba(168, 85, 247, 1)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 95}`}
                        strokeDashoffset={`${2 * Math.PI * 95 * (1 - progress / 100)}`}
                        transform="rotate(-90 100 100)"
                        style={{
                            transition: 'stroke-dashoffset 0.3s ease-out',
                            filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.8))',
                        }}
                    />
                )}
            </svg>
            
            {/* Inner counter-rotating circle */}
            <div 
                className="absolute inset-[25%]"
                style={{ 
                    animation: 'spin 45s linear infinite reverse',
                }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(168, 85, 247, 0.7)"
                        strokeWidth="0.8"
                        strokeDasharray="8 4"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="rgba(168, 85, 247, 0.6)"
                        strokeWidth="0.6"
                    />
                    {/* Cardinal runes */}
                    <g>
                        {[0, 90, 180, 270].map((angle, i) => {
                            const rad = (angle * Math.PI) / 180;
                            const x = 50 + 28 * Math.cos(rad);
                            const y = 50 + 28 * Math.sin(rad);
                            const rotation = angle - 90;
                            
                            return (
                                <text
                                    key={i}
                                    x={x}
                                    y={y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="rgba(168, 85, 247, 0.9)"
                                    transform={`rotate(${rotation} ${x} ${y})`}
                                    style={{
                                        fontSize: '8px',
                                        fontFamily: 'monospace',
                                        stroke: 'rgba(255, 240, 255, 0.5)',
                                        strokeWidth: '0.2px',
                                        paintOrder: 'stroke fill',
                                    }}
                                >
                                    {cardinalRunes[i]}
                                </text>
                            );
                        })}
                    </g>
                </svg>
            </div>
            
            {/* Center pulsing glow */}
            <div
                className="absolute inset-[40%] rounded-full animate-pulse"
                style={{
                    background: isComplete 
                        ? 'radial-gradient(circle, rgba(168, 85, 247, 1) 0%, rgba(168, 85, 247, 0.8) 40%, rgba(168, 85, 247, 0.4) 70%, transparent 100%)'
                        : 'radial-gradient(circle, rgba(168, 85, 247, 0.9) 0%, rgba(168, 85, 247, 0.6) 40%, rgba(168, 85, 247, 0.3) 70%, transparent 100%)',
                    animationDuration: '1.5s',
                }}
            />
            
            {/* Center symbol */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span 
                    className="text-xl font-mono"
                    style={{
                        color: 'rgba(168, 85, 247, 1)',
                        textShadow: '0 0 15px rgba(168, 85, 247, 0.9), 0 0 30px rgba(168, 85, 247, 0.5)',
                        stroke: 'rgba(255, 240, 255, 0.8)',
                        WebkitTextStroke: '0.5px rgba(255, 240, 255, 0.6)',
                    }}
                >
                    {isComplete ? '✧' : '◈'}
                </span>
            </div>
        </div>
    );
}

// Typing animation component with mystical styling
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
            }, 40);
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
        <span className="font-mono inline-flex items-center">
            <span className="inline-block">{displayedText}</span>
            <span 
                className="inline-block w-2 h-5 bg-primary ml-1 align-middle"
                style={{ opacity: showCursor ? 1 : 0 }}
            />
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
            {/* Backdrop - dark with subtle purple tint */}
            <div
                className={`fixed inset-0 transition-opacity duration-500 ${showModal ? 'opacity-100' : 'opacity-0'}`}
                onClick={canClose ? onClose : undefined}
                style={{ 
                    cursor: canClose ? 'pointer' : 'default',
                    background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.97) 0%, rgba(20, 15, 35, 0.98) 100%)',
                }}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
                <div
                    className={`relative max-w-md w-full transition-all duration-700 ${showModal
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 translate-y-8'
                        }`}
                >
                    {/* Corner sigils */}
                    <div className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-primary/60" style={{ boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)' }} />
                    <div className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-primary/60" style={{ boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)' }} />
                    <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-primary/60" style={{ boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)' }} />
                    <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-primary/60" style={{ boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)' }} />

                    {/* Ethereal border glow */}
                    <div 
                        className="absolute inset-0 rounded-sm" 
                        style={{ 
                            boxShadow: '0 0 40px rgba(168, 85, 247, 0.2), inset 0 0 40px rgba(168, 85, 247, 0.1)',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                        }} 
                    />

                    <Card className="border-0 bg-card/95 backdrop-blur-md relative overflow-hidden">
                        {/* Subtle mystical pattern */}
                        <div 
                            className="absolute inset-0 opacity-5"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='runes' x='0' y='0' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0,30 L60,30 M30,0 L30,60' stroke='rgba(168,85,247,0.3)' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='2' fill='rgba(168,85,247,0.2)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23runes)'/%3E%3C/svg%3E")`,
                                backgroundSize: '60px 60px',
                            }}
                        />

                        <CardContent className="p-6 sm:p-8 relative z-10">
                            {isLoading && (
                                <div className="space-y-6 text-center">
                                    {/* Ritual Circle Loader */}
                                    <RitualLoader 
                                        progress={isProving || proofComplete ? progress : (isPending ? 40 : 80)} 
                                        isComplete={proofComplete}
                                    />

                                    {/* Status Text */}
                                    <div className="space-y-3">
                                        <p 
                                            className="text-base sm:text-lg font-mono text-primary uppercase font-bold tracking-widest"
                                            style={{
                                                textShadow: '0 0 20px rgba(168, 85, 247, 0.6)',
                                            }}
                                        >
                                            <TypingText
                                                text={
                                                    proofComplete
                                                        ? 'RITUAL COMPLETE'
                                                        : isProving
                                                            ? 'WEAVING PROOF'
                                                            : isPending
                                                                ? 'AWAITING SEAL'
                                                                : 'CONFIRMING SPELL'
                                                }
                                                delay={200}
                                            />
                                        </p>
                                        <p className="text-[10px] sm:text-xs font-mono text-muted-foreground uppercase tracking-wider">
                                            {proofComplete
                                                ? '◈ The incantation is sealed ◈'
                                                : isProving
                                                    ? '◈ Ancient cryptography in motion ◈'
                                                    : isPending
                                                        ? '◈ Sign with your grimoire ◈'
                                                        : '◈ The blockchain witnesses ◈'}
                                        </p>
                                    </div>

                                    {/* Elapsed time */}
                                    {(isProving || proofComplete) && (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/40" />
                                            <p 
                                                className="text-sm font-mono text-primary tracking-widest tabular-nums"
                                                style={{ textShadow: '0 0 10px rgba(168, 85, 247, 0.5)' }}
                                            >
                                                {(elapsedMs / 1000).toFixed(1)}s
                                            </p>
                                            <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40" />
                                        </div>
                                    )}

                                    {/* Progress indicator */}
                                    <div className="flex items-center justify-center gap-4">
                                        <span className="text-primary/40 text-sm">◈</span>
                                        <span 
                                            className="font-mono text-primary text-lg tracking-wider"
                                            style={{ textShadow: '0 0 8px rgba(168, 85, 247, 0.4)' }}
                                        >
                                            {Math.round(isProving || proofComplete ? progress : (isPending ? 40 : 80))}%
                                        </span>
                                        <span className="text-primary/40 text-sm">◈</span>
                                    </div>
                                </div>
                            )}

                            {showSuccess && (
                                <div className="space-y-6 text-center animate-fadeIn">
                                    {/* Success ritual circle - static, glowing */}
                                    <div className="relative w-24 h-24 mx-auto">
                                        <div 
                                            className="absolute inset-0 rounded-full border-2 border-primary"
                                            style={{
                                                boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(168, 85, 247, 0.2)',
                                            }}
                                        />
                                        <div 
                                            className="absolute inset-2 rounded-full border border-primary/60"
                                            style={{
                                                boxShadow: 'inset 0 0 15px rgba(168, 85, 247, 0.3)',
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span 
                                                className="text-3xl"
                                                style={{
                                                    color: 'rgba(168, 85, 247, 1)',
                                                    textShadow: '0 0 20px rgba(168, 85, 247, 0.9), 0 0 40px rgba(168, 85, 247, 0.5)',
                                                }}
                                            >
                                                ✧
                                            </span>
                                        </div>
                                    </div>

                                    {/* Success Message */}
                                    <div className="space-y-2">
                                        <p 
                                            className="text-lg font-mono text-primary uppercase font-bold tracking-widest"
                                            style={{ textShadow: '0 0 15px rgba(168, 85, 247, 0.5)' }}
                                        >
                                            SPELL CONFIRMED
                                        </p>
                                        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                                            ◈ The ritual is complete ◈
                                        </p>
                                    </div>

                                    {/* Decorative line */}
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/40" />
                                        <span className="text-primary/40 text-lg">◈</span>
                                        <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/40" />
                                    </div>

                                    {/* Collapsible Transaction Details */}
                                    {txHash && (
                                        <div className="mt-4">
                                            <button
                                                onClick={() => setShowDetails(!showDetails)}
                                                className="w-full flex items-center justify-between p-3 bg-card/60 border border-primary/30 hover:border-primary/50 transition-all duration-300 rounded-sm"
                                                style={{ 
                                                    boxShadow: showDetails ? '0 0 20px rgba(168, 85, 247, 0.15)' : 'none'
                                                }}
                                            >
                                                <span className="text-xs sm:text-sm font-mono text-foreground uppercase tracking-wider">
                                                    ARCANE RECEIPT
                                                </span>
                                                <span className="text-primary font-mono text-sm">
                                                    {showDetails ? '▲' : '▼'}
                                                </span>
                                            </button>
                                            {showDetails && (
                                                <div className="mt-2 p-4 bg-card/60 border border-primary/30 space-y-2 animate-fadeIn rounded-sm" style={{ boxShadow: 'inset 0 0 20px rgba(168, 85, 247, 0.05)' }}>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
                                                        <span className="text-xs sm:text-sm font-mono text-muted-foreground uppercase tracking-wider">TX SEAL:</span>
                                                        <a
                                                            href={`#`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs sm:text-sm font-mono text-primary hover:text-primary/70 underline break-all transition-colors"
                                                            style={{ textShadow: '0 0 5px rgba(168, 85, 247, 0.3)' }}
                                                        >
                                                            {txHash.slice(0, 12)}...{txHash.slice(-6)}
                                                        </a>
                                                    </div>
                                                    <p className="text-[10px] font-mono text-muted-foreground mt-2">
                                                        VIEW ON THE CRYSTAL LEDGER
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        onClick={onClose}
                                        className="w-full mt-4 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 font-mono font-bold uppercase tracking-wider transition-all duration-300"
                                        style={{ 
                                            boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)',
                                        }}
                                    >
                                        CLOSE THE PORTAL
                                    </Button>
                                </div>
                            )}

                            {showError && (
                                <div className="space-y-6 text-center animate-fadeIn">
                                    {/* Error symbol */}
                                    <div className="relative w-24 h-24 mx-auto">
                                        <div 
                                            className="absolute inset-0 rounded-full border-2 border-destructive/60"
                                            style={{
                                                boxShadow: '0 0 25px rgba(239, 68, 68, 0.3)',
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span 
                                                className="text-3xl text-destructive"
                                                style={{
                                                    textShadow: '0 0 15px rgba(239, 68, 68, 0.5)',
                                                }}
                                            >
                                                ✕
                                            </span>
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    <div className="space-y-3">
                                        <p className="text-lg font-mono text-destructive uppercase font-bold tracking-wider">
                                            SPELL FAILED
                                        </p>
                                        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-sm" style={{ boxShadow: 'inset 0 0 20px rgba(239, 68, 68, 0.05)' }}>
                                            <p className="text-xs sm:text-sm font-mono text-destructive uppercase tracking-wider">
                                                {error?.includes('Simulation') || error?.includes('simulation')
                                                    ? 'The ritual was disrupted — consult the logs'
                                                    : 'The incantation was rejected — check the scrolls'}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={onClose}
                                        className="w-full mt-6 border-destructive/50 text-destructive hover:bg-destructive/10 font-mono uppercase tracking-wider transition-all duration-300 bg-transparent"
                                        variant="outline"
                                    >
                                        DISMISS
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
