/**
 * Event Listener Service
 * Listens to EncryptedOrderRegistered events from TLswapRegister contract
 * Stores orders instead of processing them immediately
 */

import { ethers } from 'ethers';
import { OrderStorage } from './orderStorage.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TLswapRegisterABI = JSON.parse(
    readFileSync(join(__dirname, '../abi/TLswapRegister.json'), 'utf-8')
);

export interface EventListenerConfig {
    contractAddress: string;
    rpcUrl: string;
    privateKey: string;
    startBlock?: number; // Optional: only for initial historical scan
    orderStorage?: OrderStorage; // Optional: will create one if not provided
}

export class EventListener {
    private provider: ethers.Provider;
    private contract: ethers.Contract;
    private orderStorage: OrderStorage;
    private isListening: boolean = false;
    private startBlock: number;

    constructor(config: EventListenerConfig) {
        this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
        this.contract = new ethers.Contract(config.contractAddress, TLswapRegisterABI, this.provider);
        this.orderStorage = config.orderStorage || new OrderStorage();
        this.startBlock = config.startBlock || 0;
    }

    /**
     * Start listening to events
     */
    async start(): Promise<void> {
        if (this.isListening) {
            console.log('[EventListener] Already listening');
            return;
        }

        this.isListening = true;
        console.log('[EventListener] Starting event listener...');
        console.log(`  Contract: ${this.contract.target}`);
        console.log(`  Start block: ${this.startBlock || 'latest'}`);

        // Optionally process historical events (only if startBlock is set)
        if (this.startBlock > 0) {
            await this.processHistoricalEvents();
        } else {
            console.log('[EventListener] Skipping historical events (startBlock not set)');
        }

        // Start listening to new events in real-time
        this.contract.on('EncryptedOrderRegistered', async (orderId, ciphertextIpfs, event) => {
            console.log(`\n[EventListener] New EncryptedOrderRegistered event detected`);
            console.log(`  Block: ${event.log.blockNumber}`);
            console.log(`  OrderId: ${orderId}`);
            console.log(`  Ciphertext length: ${ciphertextIpfs.length} bytes`);
            
            await this.handleNewOrder(orderId, ciphertextIpfs, event.log.blockNumber);
        });

        const stats = this.orderStorage.getStats();
        console.log(`[EventListener] Event listener started`);
        console.log(`  Stored orders: ${stats.total} (${stats.pending} pending, ${stats.processed} processed)`);
    }

    /**
     * Stop listening to events
     */
    stop(): void {
        if (!this.isListening) {
            return;
        }

        this.isListening = false;
        this.contract.removeAllListeners();
        console.log('[EventListener] Event listener stopped');
    }

    /**
     * Process historical events from startBlock to current (optional, for initial sync)
     */
    private async processHistoricalEvents(): Promise<void> {
        console.log('[EventListener] Processing historical events...');
        
        const currentBlock = await this.provider.getBlockNumber();
        if (this.startBlock >= currentBlock) {
            console.log(`  No historical events (startBlock ${this.startBlock} >= current ${currentBlock})`);
            return;
        }

        console.log(`  Scanning blocks ${this.startBlock} to ${currentBlock}`);

        // Query events in batches
        const batchSize = 1000;
        let fromBlock = this.startBlock;
        let totalFound = 0;
        
        while (fromBlock < currentBlock) {
            const toBlock = Math.min(fromBlock + batchSize - 1, currentBlock);
            
            try {
                const filter = this.contract.filters.EncryptedOrderRegistered();
                const events = await this.contract.queryFilter(filter, fromBlock, toBlock);
                
                console.log(`  Found ${events.length} events in blocks ${fromBlock}-${toBlock}`);
                
                for (const event of events) {
                    if (event.args) {
                        const orderId = event.args[0];
                        const ciphertextIpfs = event.args[1];
                        await this.handleNewOrder(orderId, ciphertextIpfs, event.log.blockNumber);
                        totalFound++;
                    }
                }
                
                fromBlock = toBlock + 1;
            } catch (error) {
                console.error(`  Error processing blocks ${fromBlock}-${toBlock}:`, error);
                // Continue with next batch
                fromBlock = toBlock + 1;
            }
        }

        console.log(`[EventListener] Historical events processed (${totalFound} orders stored)`);
    }

    /**
     * Handle a new encrypted order - store it instead of processing immediately
     */
    private async handleNewOrder(orderId: string, ciphertextIpfs: string, blockNumber: number): Promise<void> {
        try {
            // Check if order already exists
            if (this.orderStorage.getOrder(orderId)) {
                console.log(`  [EventListener] Order ${orderId} already stored, skipping`);
                return;
            }

            // Convert hex string to bytes
            const ciphertextBytes = ethers.getBytes(ciphertextIpfs);
            
            // Parse ciphertext to get target round
            const ciphertextStr = new TextDecoder().decode(ciphertextBytes);
            const ciphertextData = JSON.parse(ciphertextStr);
            const targetRound = ciphertextData.round || ciphertextData.timelock?.targetRound;
            
            if (!targetRound) {
                console.error(`  [EventListener] No target round found in ciphertext for order ${orderId}`);
                return;
            }

            // Store the order (will be executed later by the scheduler)
            this.orderStorage.addOrder({
                orderId,
                ciphertextIpfs,
                ciphertextBytes,
                targetRound,
                blockNumber
            });
            
            console.log(`  [EventListener] Order ${orderId} stored (target round: ${targetRound})`);
            
        } catch (error) {
            console.error(`  [EventListener] Error handling order ${orderId}:`, error);
        }
    }

    /**
     * Get order storage instance
     */
    getOrderStorage(): OrderStorage {
        return this.orderStorage;
    }
}

