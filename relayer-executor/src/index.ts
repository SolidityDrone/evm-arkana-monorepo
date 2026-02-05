/**
 * Relayer Executor
 * Main entry point for the timelock swap relayer service
 */

import { config } from 'dotenv';
import { ethers } from 'ethers';
import { EventListener } from './services/eventListener.js';

// Load environment variables
config();

async function main() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║         TIMELOCK SWAP RELAYER EXECUTOR                     ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');

    // Validate required environment variables
    const requiredEnvVars = [
        'RPC_URL',
        'CONTRACT_ADDRESS',
        'PRIVATE_KEY'
    ];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.error(`❌ Missing required environment variable: ${envVar}`);
            process.exit(1);
        }
    }

    // Validate private key
    const privateKey = process.env.PRIVATE_KEY!;
    const placeholderKey = '0x0000000000000000000000000000000000000000000000000000000000000000';

    if (privateKey === placeholderKey) {
        console.error('❌ Invalid private key: Using placeholder value from .env.example');
        console.error('   Please set a valid private key in your .env file');
        console.error('   The private key should be a 64-character hex string (with or without 0x prefix)');
        process.exit(1);
    }

    // Try to validate the private key format and range
    try {
        // Remove 0x prefix if present
        const keyWithoutPrefix = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;

        if (keyWithoutPrefix.length !== 64) {
            throw new Error('Private key must be 64 hex characters');
        }

        // Try to parse as bigint to validate it's a valid hex number
        const keyBigInt = BigInt('0x' + keyWithoutPrefix);
        if (keyBigInt === 0n) {
            throw new Error('Private key cannot be zero');
        }

        // Validate private key is within valid range for secp256k1 curve
        // secp256k1 curve order: 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
        const SECP256K1_CURVE_ORDER = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
        if (keyBigInt >= SECP256K1_CURVE_ORDER) {
            throw new Error(`Private key must be less than curve order (0x${SECP256K1_CURVE_ORDER.toString(16)})`);
        }

        // Try to create a wallet to validate the key works
        // This will catch any other edge cases
        try {
            const testProvider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
            new ethers.Wallet(privateKey, testProvider);
        } catch (walletError) {
            throw new Error(`Invalid private key for wallet creation: ${walletError instanceof Error ? walletError.message : walletError}`);
        }
    } catch (error) {
        console.error('❌ Invalid private key:', error instanceof Error ? error.message : error);
        console.error('   Private key must be a valid 64-character hex string');
        console.error('   The key must be within the valid range for secp256k1 curve');
        console.error('   Example: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
        console.error('');
        console.error('   Make sure your .env file has a valid private key set.');
        console.error('   If you copied from .env.example, you need to replace the placeholder value.');
        process.exit(1);
    }

    const config = {
        contractAddress: process.env.CONTRACT_ADDRESS!,
        rpcUrl: process.env.RPC_URL!,
        privateKey: privateKey,
        startBlock: process.env.START_BLOCK ? parseInt(process.env.START_BLOCK) : undefined,
        pollInterval: process.env.POLL_INTERVAL ? parseInt(process.env.POLL_INTERVAL) : undefined
    };

    console.log('Configuration:');
    console.log(`  Contract: ${config.contractAddress}`);
    console.log(`  RPC URL: ${config.rpcUrl}`);
    // Show masked private key for debugging (first 6 and last 4 chars)
    const maskedKey = privateKey.length > 10
        ? `${privateKey.slice(0, 8)}...${privateKey.slice(-6)}`
        : '***';
    console.log(`  Private Key: ${maskedKey} (masked)`);
    console.log(`  Start Block: ${config.startBlock || 'latest'}`);
    console.log(`  Poll Interval: ${config.pollInterval || 12000}ms`);
    console.log('');

    // Create and start event listener
    const eventListener = new EventListener(config);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n[Main] Received SIGINT, shutting down...');
        eventListener.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n[Main] Received SIGTERM, shutting down...');
        eventListener.stop();
        process.exit(0);
    });

    // Start the listener
    try {
        await eventListener.start();
        console.log('\n✅ Relayer executor started successfully');
        console.log('   Listening for EncryptedOrderRegistered events...');
        console.log('   Press Ctrl+C to stop\n');
    } catch (error) {
        console.error('❌ Failed to start relayer executor:', error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

