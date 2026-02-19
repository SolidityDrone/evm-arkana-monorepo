'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export interface ProofParamRow {
    label: string;
    value: string;
    mono?: boolean;
}

export interface ProofParamsConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description: string;
    params: ProofParamRow[];
    disclaimer?: string;
    confirmLabel?: string;
    isSigning?: boolean;
}

/**
 * Modal shown before generating a proof (withdraw/send or absorb variants).
 * Displays the parameters that will be committed in the proof and asks for explicit confirmation.
 */
export function ProofParamsConfirmModal({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    params,
    disclaimer = 'Verify that these parameters are correct before confirming. By confirming you authorize generating a zero-knowledge proof that commits to these values.',
    confirmLabel = 'Confirm & generate proof',
    isSigning = false,
}: ProofParamsConfirmModalProps) {
    const handleConfirm = async () => {
        try {
            await onConfirm();
            onOpenChange(false);
        } catch {
            // Keep modal open on error
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-2xl w-[90vw] sm:w-[600px] min-w-[320px] max-h-[90vh] overflow-y-auto bg-card/98 backdrop-blur-xl border-primary/40 shadow-2xl mx-auto"
                style={{ maxWidth: '600px', width: '90vw' }}
                onPointerDownOutside={(e) => !isSigning && onOpenChange(false)}
            >
                <DialogHeader className="space-y-3 pb-4 border-b border-border/50">
                    <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
                        {title}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                    {/* Parameters Section */}
                    <div className="rounded-xl border border-border/60 bg-gradient-to-br from-muted/30 to-muted/10 p-4 sm:p-5 space-y-3">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Proof Parameters
                        </h3>
                        <div className="space-y-3">
                            {params.map(({ label, value, mono = true }, idx) => (
                                <div
                                    key={label}
                                    className={`flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3 pb-3 ${
                                        idx < params.length - 1 ? 'border-b border-border/30' : ''
                                    }`}
                                >
                                    <div className="flex-shrink-0 w-full sm:w-32">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            {label}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span
                                            className={`text-xs sm:text-sm break-words ${
                                                mono
                                                    ? 'font-mono text-foreground bg-muted/50 px-2 py-1 rounded border border-border/30'
                                                    : 'text-foreground'
                                            }`}
                                        >
                                            {value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Disclaimer Section */}
                    <div className="rounded-xl border border-amber-500/50 bg-gradient-to-br from-amber-500/15 to-amber-500/5 p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 leading-relaxed">
                            {disclaimer}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 mt-4 border-t border-border/50">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSigning}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isSigning}
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                    >
                        {isSigning ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">⏳</span>
                                Generating…
                            </span>
                        ) : (
                            confirmLabel
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
