'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface EdDSASignModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description: string;
    isSigning?: boolean;
}

export function EdDSASignModal({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    isSigning = false,
}: EdDSASignModalProps) {
    const handleConfirm = async () => {
        try {
            await onConfirm();
            onOpenChange(false);
        } catch {
            // Keep modal open on error so user can retry or cancel
        }
    };

    return (
        <Dialog 
            open={open} 
            onOpenChange={onOpenChange}
            onPointerDownOutside={(e) => !isSigning && onOpenChange(false)}
        >
            <DialogContent
                className="max-w-sm w-[33vw] min-w-[320px] bg-card/95 backdrop-blur-sm border-primary/30 mx-auto"
            >
                <DialogHeader className="pb-3">
                    <DialogTitle
                        className="text-center text-sm sm:text-base font-sans tracking-wider uppercase"
                        style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
                    >
                        {title}
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground text-center mb-6">{description}</p>
                <div className="flex gap-3 justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSigning}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={isSigning}>
                        {isSigning ? 'Signing…' : 'Sign'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
