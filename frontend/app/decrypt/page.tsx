'use client';

import React from 'react';
import { DecryptOrder } from '@/components/DecryptOrder';

export default function DecryptPage() {
    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                        Order Decryption
                    </h1>
                    <p className="text-muted-foreground">
                        Decrypt timelock-encrypted swap orders when their drand round becomes available
                    </p>
                </div>
                
                <DecryptOrder />
                
                <div className="mt-8 p-4 bg-secondary/30 rounded-sm border border-border">
                    <h3 className="text-primary font-medium mb-2">How it works</h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                        <li>Sign in using &quot;Sign Sigil&quot; to derive your keys</li>
                        <li>Select the token and nonce for the order you want to decrypt</li>
                        <li>The nonce commitment is auto-computed from your keys</li>
                        <li>The encrypted order is fetched from TLswapRegister</li>
                        <li>All decryptable orders in the chain are decrypted automatically</li>
                        <li>Pending orders show their unlock time and target round</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
