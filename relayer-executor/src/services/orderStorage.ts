/**
 * Order Storage Service
 * Stores pending orders and manages their execution schedule
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface PendingOrder {
    orderId: string;
    ciphertextIpfs: string;
    ciphertextBytes: Uint8Array;
    targetRound: number;
    registeredAt: number; // timestamp
    blockNumber: number;
    processed: boolean;
    executedAt?: number;
    txHash?: string;
    error?: string;
}

export class OrderStorage {
    private orders: Map<string, PendingOrder> = new Map();
    private storageFile: string;

    constructor(storageFile?: string) {
        // Default to orders.json in the project root
        this.storageFile = storageFile || join(__dirname, '../../orders.json');
        this.loadFromDisk();
    }

    /**
     * Store a new order
     */
    addOrder(order: Omit<PendingOrder, 'processed' | 'registeredAt'>): void {
        const pendingOrder: PendingOrder = {
            ...order,
            processed: false,
            registeredAt: Date.now()
        };
        
        this.orders.set(order.orderId, pendingOrder);
        this.saveToDisk();
        
        console.log(`[OrderStorage] Stored order ${order.orderId} (target round: ${order.targetRound})`);
    }

    /**
     * Get a pending order by ID
     */
    getOrder(orderId: string): PendingOrder | undefined {
        return this.orders.get(orderId);
    }

    /**
     * Get all pending orders (not yet executed)
     */
    getPendingOrders(): PendingOrder[] {
        return Array.from(this.orders.values())
            .filter(order => !order.processed)
            .sort((a, b) => a.targetRound - b.targetRound); // Sort by target round
    }

    /**
     * Get orders ready for execution (round is available)
     */
    getReadyOrders(currentRound: number): PendingOrder[] {
        return this.getPendingOrders()
            .filter(order => order.targetRound <= currentRound);
    }

    /**
     * Mark an order as processed
     */
    markAsProcessed(orderId: string, txHash?: string, error?: string): void {
        const order = this.orders.get(orderId);
        if (order) {
            order.processed = true;
            order.executedAt = Date.now();
            if (txHash) {
                order.txHash = txHash;
            }
            if (error) {
                order.error = error;
            }
            this.saveToDisk();
        }
    }

    /**
     * Get all orders (including processed)
     */
    getAllOrders(): PendingOrder[] {
        return Array.from(this.orders.values());
    }

    /**
     * Get statistics
     */
    getStats(): { total: number; pending: number; processed: number } {
        const all = Array.from(this.orders.values());
        return {
            total: all.length,
            pending: all.filter(o => !o.processed).length,
            processed: all.filter(o => o.processed).length
        };
    }

    /**
     * Load orders from disk
     */
    private loadFromDisk(): void {
        try {
            const data = readFileSync(this.storageFile, 'utf-8');
            const orders = JSON.parse(data) as PendingOrder[];
            
            // Convert ciphertextBytes from hex string back to Uint8Array
            for (const order of orders) {
                if (typeof order.ciphertextBytes === 'string') {
                    // It's stored as hex string, convert back
                    const hex = order.ciphertextBytes;
                    const bytes = new Uint8Array(
                        hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
                    );
                    order.ciphertextBytes = bytes;
                }
            }
            
            this.orders = new Map(orders.map(order => [order.orderId, order]));
            console.log(`[OrderStorage] Loaded ${orders.length} orders from disk`);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                // File doesn't exist yet, that's okay
                console.log('[OrderStorage] No existing orders file, starting fresh');
            } else {
                console.error('[OrderStorage] Error loading orders from disk:', error);
            }
        }
    }

    /**
     * Save orders to disk
     */
    private saveToDisk(): void {
        try {
            const orders = Array.from(this.orders.values());
            
            // Convert ciphertextBytes to hex string for JSON serialization
            const serializable = orders.map(order => ({
                ...order,
                ciphertextBytes: Array.from(order.ciphertextBytes)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('')
            }));
            
            const data = JSON.stringify(serializable, null, 2);
            writeFileSync(this.storageFile, data, 'utf-8');
        } catch (error) {
            console.error('[OrderStorage] Error saving orders to disk:', error);
        }
    }
}

