/**
 * API route for relaying transactions
 * Uses PRIVATE_KEY from environment to send transactions on behalf of users
 */

import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

// Define a local anvil chain for development
const anvil = {
    id: 31337,
    name: 'Anvil',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: { http: ['http://127.0.0.1:8545'] },
    },
} as const;

/**
 * POST /api/relayer
 * Sends a transaction using the relayer's private key
 * Body: { 
 *   to: string,           // Contract address
 *   data: string,         // Encoded calldata (hex string)
 *   value?: string,       // Optional value in wei (default: "0")
 *   gasLimit?: string,    // Optional gas limit (default: "3000000")
 *   chainId?: number      // Optional chain ID (default: 31337 for anvil)
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to, data, value = '0', gasLimit = '3000000', chainId = 31337 } = body;

        // Validate required fields
        if (!to || typeof to !== 'string') {
            return NextResponse.json(
                { error: 'to address is required and must be a string' },
                { status: 400 }
            );
        }

        if (!data || typeof data !== 'string') {
            return NextResponse.json(
                { error: 'data (calldata) is required and must be a hex string' },
                { status: 400 }
            );
        }

        // Validate hex format
        if (!data.startsWith('0x')) {
            return NextResponse.json(
                { error: 'data must be a hex string starting with 0x' },
                { status: 400 }
            );
        }

        // Get private key from environment
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            return NextResponse.json(
                { error: 'PRIVATE_KEY not configured in environment variables' },
                { status: 500 }
            );
        }

        // Normalize private key format
        const normalizedPrivateKey = privateKey.startsWith('0x') 
            ? privateKey as `0x${string}` 
            : `0x${privateKey}` as `0x${string}`;

        // Create account from private key
        const account = privateKeyToAccount(normalizedPrivateKey);

        // Determine which chain to use
        const chain = chainId === 11155111 ? sepolia : anvil;
        const rpcUrl = chainId === 11155111 
            ? process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'
            : 'http://127.0.0.1:8545';

        // Create clients
        const publicClient = createPublicClient({
            chain,
            transport: http(rpcUrl),
        });

        const walletClient = createWalletClient({
            account,
            chain,
            transport: http(rpcUrl),
        });

        console.log('📤 Relayer sending transaction:');
        console.log('  From:', account.address);
        console.log('  To:', to);
        console.log('  Data length:', data.length);
        console.log('  Gas limit:', gasLimit);
        console.log('  Chain ID:', chainId);

        // Estimate gas first (optional but helpful for debugging)
        let estimatedGas: bigint;
        try {
            estimatedGas = await publicClient.estimateGas({
                account: account.address,
                to: to as `0x${string}`,
                data: data as `0x${string}`,
                value: BigInt(value),
            });
            console.log('  Estimated gas:', estimatedGas.toString());
        } catch (estimateError: any) {
            console.warn('  Gas estimation failed:', estimateError.message);
            // Use provided gas limit as fallback
            estimatedGas = BigInt(gasLimit);
        }

        // Use the higher of estimated gas (with 20% buffer) or provided gas limit
        const finalGasLimit = estimatedGas * BigInt(120) / BigInt(100) > BigInt(gasLimit) 
            ? estimatedGas * BigInt(120) / BigInt(100)
            : BigInt(gasLimit);

        // Send transaction
        const hash = await walletClient.sendTransaction({
            to: to as `0x${string}`,
            data: data as `0x${string}`,
            value: BigInt(value),
            gas: finalGasLimit,
        });

        console.log('✅ Transaction sent:', hash);

        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({ 
            hash,
            timeout: 60_000, // 60 second timeout
        });

        console.log('📦 Transaction confirmed:');
        console.log('  Block:', receipt.blockNumber.toString());
        console.log('  Gas used:', receipt.gasUsed.toString());
        console.log('  Status:', receipt.status);

        return NextResponse.json({
            success: true,
            hash,
            blockNumber: receipt.blockNumber.toString(),
            gasUsed: receipt.gasUsed.toString(),
            status: receipt.status,
            from: account.address,
        });

    } catch (error) {
        console.error('Relayer error:', error);

        let errorMessage = 'Failed to send transaction';
        let errorDetails = {};

        if (error instanceof Error) {
            errorMessage = error.message;
            
            // Check for common errors
            if (error.message.includes('insufficient funds')) {
                errorMessage = 'Relayer has insufficient funds. Please fund the relayer address.';
            } else if (error.message.includes('nonce')) {
                errorMessage = 'Nonce error. Please try again.';
            } else if (error.message.includes('revert')) {
                errorMessage = `Transaction reverted: ${error.message}`;
            }

            errorDetails = {
                name: error.name,
                message: error.message,
            };
        }

        return NextResponse.json(
            {
                error: errorMessage,
                details: errorDetails,
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/relayer
 * Returns the relayer address (for display purposes)
 */
export async function GET() {
    try {
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            return NextResponse.json(
                { error: 'PRIVATE_KEY not configured' },
                { status: 500 }
            );
        }

        const normalizedPrivateKey = privateKey.startsWith('0x') 
            ? privateKey as `0x${string}` 
            : `0x${privateKey}` as `0x${string}`;

        const account = privateKeyToAccount(normalizedPrivateKey);

        return NextResponse.json({
            address: account.address,
            configured: true,
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to get relayer info', configured: false },
            { status: 500 }
        );
    }
}

