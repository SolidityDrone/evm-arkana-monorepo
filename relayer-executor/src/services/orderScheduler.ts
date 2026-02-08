/**
 * Order Scheduler Service
 * Periodically checks for ready orders and executes them
 */

import { OrderStorage, PendingOrder } from './orderStorage.js';
import { OrderProcessor } from './orderProcessor.js';
import { getCurrentRound, isRoundAvailable } from '../utils/drand.js';

export interface OrderSchedulerConfig {
    checkInterval: number; // milliseconds
    orderStorage: OrderStorage;
    orderProcessor: OrderProcessor;
}

export class OrderScheduler {
    private config: OrderSchedulerConfig;
    private intervalId?: NodeJS.Timeout;
    private isRunning: boolean = false;
    private isProcessing: boolean = false;

    constructor(config: OrderSchedulerConfig) {
        this.config = config;
    }

    /**
     * Start the scheduler
     */
    start(): void {
        if (this.isRunning) {
            console.log('[OrderScheduler] Already running');
            return;
        }

        this.isRunning = true;
        console.log(`[OrderScheduler] Starting scheduler (check interval: ${this.config.checkInterval}ms)`);
        
        // Check immediately
        this.checkAndExecute();
        
        // Then check periodically
        this.intervalId = setInterval(() => {
            this.checkAndExecute();
        }, this.config.checkInterval);
    }

    /**
     * Stop the scheduler
     */
    stop(): void {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
        console.log('[OrderScheduler] Scheduler stopped');
    }

    /**
     * Check for ready orders and execute them
     */
    private async checkAndExecute(): Promise<void> {
        if (this.isProcessing) {
            // Skip if already processing
            return;
        }

        this.isProcessing = true;

        try {
            const currentRound = getCurrentRound();
            const readyOrders = this.config.orderStorage.getReadyOrders(currentRound);

            if (readyOrders.length === 0) {
                const stats = this.config.orderStorage.getStats();
                console.log(`[OrderScheduler] No ready orders (current round: ${currentRound}, pending: ${stats.pending})`);
                return;
            }

            console.log(`[OrderScheduler] Found ${readyOrders.length} ready order(s) (current round: ${currentRound})`);

            // Process orders sequentially to avoid race conditions
            for (const order of readyOrders) {
                try {
                    console.log(`[OrderScheduler] Executing order ${order.orderId} (target round: ${order.targetRound})`);
                    
                    const processed = await this.config.orderProcessor.processOrder(
                        order.orderId,
                        order.ciphertextBytes,
                        order.targetRound
                    );

                    // Mark as processed
                    this.config.orderStorage.markAsProcessed(
                        order.orderId,
                        processed.txHash
                    );

                    console.log(`[OrderScheduler] Order ${order.orderId} executed successfully`);
                } catch (error) {
                    console.error(`[OrderScheduler] Error executing order ${order.orderId}:`, error);
                    
                    // Mark with error but keep it for retry (or remove if it's a permanent error)
                    this.config.orderStorage.markAsProcessed(
                        order.orderId,
                        undefined,
                        error instanceof Error ? error.message : String(error)
                    );
                }
            }
        } catch (error) {
            console.error('[OrderScheduler] Error in checkAndExecute:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Manually trigger a check
     */
    async triggerCheck(): Promise<void> {
        await this.checkAndExecute();
    }
}


