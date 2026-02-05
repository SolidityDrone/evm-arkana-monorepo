/**
 * Event Listener Service
 * Listens to EncryptedOrderRegistered events from TLswapRegister contract
 */

import { ethers } from 'ethers';
import { OrderProcessor } from './orderProcessor.js';
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
    startBlock?: number;
    pollInterval?: number;
}

export class EventListener {
    private provider: ethers.Provider;
    private contract: ethers.Contract;
    private orderProcessor: OrderProcessor;
    private isListening: boolean = false;
    private startBlock: number;
    private pollInterval: number;

    constructor(config: EventListenerConfig) {
        this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
        this.contract = new ethers.Contract(config.contractAddress, TLswapRegisterABI, this.provider);
        this.orderProcessor = new OrderProcessor(
            config.contractAddress,
            this.provider,
            config.privateKey
        );
        this.startBlock = config.startBlock || 0;
        this.pollInterval = config.pollInterval || 12000; // 12 seconds default
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
        console.log(`  Start block: ${this.startBlock}`);
        console.log(`  Poll interval: ${this.pollInterval}ms`);

        // Process historical events first
        await this.processHistoricalEvents();

        // Start listening to new events
        this.contract.on('EncryptedOrderRegistered', async (orderId, ciphertextIpfs, event) => {
            console.log(`\n[EventListener] New EncryptedOrderRegistered event detected`);
            console.log(`  Block: ${event.log.blockNumber}`);
            console.log(`  OrderId: ${orderId}`);
            console.log(`  Ciphertext length: ${ciphertextIpfs.length} bytes`);
            
            await this.handleNewOrder(orderId, ciphertextIpfs);
        });

        console.log('[EventListener] Event listener started');
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
     * Process historical events from startBlock to current
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
                        await this.handleNewOrder(orderId, ciphertextIpfs);
                    }
                }
                
                fromBlock = toBlock + 1;
            } catch (error) {
                console.error(`  Error processing blocks ${fromBlock}-${toBlock}:`, error);
                // Continue with next batch
                fromBlock = toBlock + 1;
            }
        }

        console.log('[EventListener] Historical events processed');
    }

    /**
     * Handle a new encrypted order
     */
    private async handleNewOrder(orderId: string, ciphertextIpfs: string): Promise<void> {
        try {
            // Convert hex string to bytes
            const ciphertextBytes = ethers.getBytes(ciphertextIpfs);
            
            // Parse ciphertext to get target round
            const ciphertextStr = new TextDecoder().decode(ciphertextBytes);
            const ciphertextData = JSON.parse(ciphertextStr);
            const targetRound = ciphertextData.round || ciphertextData.timelock?.targetRound;
            
            if (!targetRound) {
                console.error(`  [EventListener] No target round found in ciphertext`);
                return;
            }

            console.log(`  [EventListener] Processing order ${orderId} (round ${targetRound})`);
            
            // Process the order (will wait for round if needed)
            await this.orderProcessor.processOrder(orderId, ciphertextBytes, targetRound);
            
        } catch (error) {
            console.error(`  [EventListener] Error handling order ${orderId}:`, error);
        }
    }

    /**
     * Manually process a specific order
     */
    async processOrder(orderId: string): Promise<void> {
        try {
            // Get ciphertext from contract
            const ciphertext = await this.contract.getEncryptedOrder(orderId);
            if (!ciphertext || ciphertext.length === 0) {
                throw new Error(`Order ${orderId} not found`);
            }

            const ciphertextBytes = ethers.getBytes(ciphertext);
            const ciphertextStr = new TextDecoder().decode(ciphertextBytes);
            const ciphertextData = JSON.parse(ciphertextStr);
            const targetRound = ciphertextData.round || ciphertextData.timelock?.targetRound;

            if (!targetRound) {
                throw new Error('No target round found in ciphertext');
            }

            await this.orderProcessor.processOrder(orderId, ciphertextBytes, targetRound);
        } catch (error) {
            console.error(`Error processing order ${orderId}:`, error);
            throw error;
        }
    }
}

