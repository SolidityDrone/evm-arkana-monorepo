/**
 * Order Processor Service
 * Processes encrypted orders: decrypts and executes swaps
 */

import { ethers } from 'ethers';
import { decryptTimelockOrder } from '../utils/decrypt.js';
import { isRoundAvailable, waitForRound, getCurrentRound } from '../utils/drand.js';
import { buildV2SwapCalldata } from '../utils/swap.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TLswapRegisterABI = JSON.parse(
    readFileSync(join(__dirname, '../abi/TLswapRegister.json'), 'utf-8')
);

export interface ProcessedOrder {
    orderId: string;
    round: number;
    decrypted: any;
    executed: boolean;
    txHash?: string;
}

export class OrderProcessor {
    private contract: ethers.Contract;
    private wallet: ethers.Wallet;
    private processedOrders: Map<string, ProcessedOrder> = new Map();

    constructor(
        contractAddress: string,
        provider: ethers.Provider,
        privateKey: string
    ) {
        this.contract = new ethers.Contract(contractAddress, TLswapRegisterABI, provider);
        
        try {
            this.wallet = new ethers.Wallet(privateKey, provider);
        } catch (error) {
            throw new Error(
                `Failed to create wallet from private key: ${error instanceof Error ? error.message : error}\n` +
                `Make sure your PRIVATE_KEY in .env is a valid 64-character hex string (with or without 0x prefix)`
            );
        }
        
        // Connect contract with wallet for write operations
        this.contract = this.contract.connect(this.wallet) as ethers.Contract;
    }

    /**
     * Process a single encrypted order
     */
    async processOrder(orderId: string, ciphertextBytes: Uint8Array, targetRound: number): Promise<ProcessedOrder> {
        console.log(`\n[OrderProcessor] Processing order ${orderId}`);
        console.log(`  Target round: ${targetRound}`);
        console.log(`  Current round: ${getCurrentRound()}`);

        // Check if already processed
        if (this.processedOrders.has(orderId)) {
            const existing = this.processedOrders.get(orderId)!;
            if (existing.executed) {
                console.log(`  Order ${orderId} already executed`);
                return existing;
            }
        }

        // Wait for round to become available
        if (!isRoundAvailable(targetRound)) {
            console.log(`  Waiting for round ${targetRound}...`);
            await waitForRound(targetRound);
        }

        // Decrypt the order
        console.log(`  Decrypting order...`);
        let decrypted;
        try {
            decrypted = await decryptTimelockOrder(ciphertextBytes, targetRound);
            console.log(`  Decrypted successfully`);
            console.log(`  Order data:`, {
                sharesAmount: decrypted.sharesAmount,
                amountOutMin: decrypted.amountOutMin,
                tokenOut: decrypted.tokenOut,
                recipient: decrypted.recipient,
                hasNextCiphertext: !!decrypted.nextCiphertext
            });
        } catch (error) {
            console.error(`  Failed to decrypt order:`, error);
            throw error;
        }

        // Execute the swap
        console.log(`  Executing swap...`);
        let txHash: string | undefined;
        try {
            txHash = await this.executeSwap(orderId, decrypted);
            console.log(`  Swap executed successfully: ${txHash}`);
        } catch (error) {
            console.error(`  Failed to execute swap:`, error);
            throw error;
        }

        const processed: ProcessedOrder = {
            orderId,
            round: targetRound,
            decrypted,
            executed: true,
            txHash
        };

        this.processedOrders.set(orderId, processed);

        // If there's a next ciphertext (nested order), process it recursively
        if (decrypted.nextCiphertext) {
            console.log(`  Found nested order, processing...`);
            // nextCiphertext is a JSON string, convert to bytes
            const nextCiphertextBytes = new TextEncoder().encode(decrypted.nextCiphertext);
            // Extract round from next ciphertext (it's in the JSON)
            const nextCiphertextData = JSON.parse(decrypted.nextCiphertext);
            const nextRound = nextCiphertextData.round || nextCiphertextData.timelock?.targetRound;
            
            if (!nextRound) {
                console.error(`  No round found in nested ciphertext`);
                return processed;
            }
            
            // Generate a new orderId for the nested order (hash of ciphertext)
            const nextOrderId = ethers.keccak256(ethers.hexlify(nextCiphertextBytes));
            
            await this.processOrder(nextOrderId, nextCiphertextBytes, nextRound);
        }

        return processed;
    }

    /**
     * Execute swap intent on the contract
     */
    private async executeSwap(orderId: string, orderData: any): Promise<string> {
        // Build swap calldata
        // tokenIn should be the underlying token of the Arkana vault
        // If not provided in orderData, use tokenAddress (vault token address)
        // The contract will withdraw tokens from the vault, so tokenIn is what comes out of the vault
        const tokenAddress = orderData.tokenAddress || orderData.tokenIn;
        const tokenIn = orderData.tokenIn || tokenAddress; // Use tokenAddress as fallback
        const tokenOut = orderData.tokenOut;
        
        if (!tokenIn || tokenIn === '0x0000000000000000000000000000000000000000') {
            throw new Error('tokenIn or tokenAddress must be provided in order data');
        }
        
        const amountOutMin = BigInt(orderData.amountOutMin);
        const sharesAmount = BigInt(orderData.sharesAmount);
        
        // Build swap calldata (using V2 for simplicity - replace with Universal Router in production)
        const swapData = buildV2SwapCalldata(
            tokenIn,
            tokenOut,
            BigInt(0), // amountIn - will be determined by contract (all available)
            amountOutMin,
            this.contract.target as string // recipient (contract will distribute)
        );

        // Prepare executeSwapIntent parameters
        const intentId = ethers.keccak256(ethers.toUtf8Bytes(orderId));
        const intentor = orderData.intentor || ethers.ZeroAddress; // Should be from withdraw
        // tokenAddress is the Arkana vault token address (for withdrawForSwap)
        // If not provided, assume it's the same as tokenIn
        const vaultTokenAddress = orderData.tokenAddress || tokenIn;
        
        const params = [
            intentId,
            intentor,
            vaultTokenAddress, // tokenAddress for Arkana vault
            sharesAmount,
            tokenIn, // token to swap from
            tokenOut, // token to swap to
            amountOutMin,
            orderData.slippageBps || 50,
            orderData.deadline || Math.floor(Date.now() / 1000) + 60 * 20,
            orderData.executionFeeBps || 0,
            orderData.recipient,
            orderData.round || parseInt(orderData.targetRound || '0'),
            swapData.calldata,
            swapData.target,
            BigInt(orderData.prevHash || '0'),
            BigInt(orderData.nextHash || '0'),
            BigInt(orderData.tlHashchain || '0')
        ];

        // Estimate gas
        let gasEstimate: bigint;
        try {
            gasEstimate = await this.contract.executeSwapIntent.estimateGas(...params);
            console.log(`  Gas estimate: ${gasEstimate.toString()}`);
        } catch (error) {
            console.error(`  Gas estimation failed:`, error);
            throw error;
        }

        // Execute transaction
        const tx = await this.contract.executeSwapIntent(...params, {
            gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
        });

        console.log(`  Transaction sent: ${tx.hash}`);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`  Transaction confirmed in block ${receipt?.blockNumber}`);

        return tx.hash;
    }

    /**
     * Get processed order status
     */
    getProcessedOrder(orderId: string): ProcessedOrder | undefined {
        return this.processedOrders.get(orderId);
    }

    /**
     * Get all processed orders
     */
    getAllProcessedOrders(): ProcessedOrder[] {
        return Array.from(this.processedOrders.values());
    }
}

