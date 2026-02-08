/**
 * Manual order processing script
 * Usage: tsx src/scripts/processOrder.ts <orderId>
 */

import { config } from 'dotenv';
import { ethers } from 'ethers';
import { EventListener } from '../services/eventListener.js';

config();

async function main() {
    const orderId = process.argv[2];
    
    if (!orderId) {
        console.error('Usage: tsx src/scripts/processOrder.ts <orderId>');
        process.exit(1);
    }

    // Validate required environment variables
    const requiredEnvVars = ['RPC_URL', 'CONTRACT_ADDRESS', 'PRIVATE_KEY'];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.error(`❌ Missing required environment variable: ${envVar}`);
            process.exit(1);
        }
    }

    const config = {
        contractAddress: process.env.CONTRACT_ADDRESS!,
        rpcUrl: process.env.RPC_URL!,
        privateKey: process.env.PRIVATE_KEY!,
    };

    console.log('Processing order:', orderId);
    console.log('Contract:', config.contractAddress);
    console.log('');

    const eventListener = new EventListener(config);
    
    try {
        await eventListener.processOrder(orderId);
        console.log('\n✅ Order processed successfully');
    } catch (error) {
        console.error('\n❌ Failed to process order:', error);
        process.exit(1);
    }
}

main().catch(console.error);


