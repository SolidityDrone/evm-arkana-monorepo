/**
 * API route for uploading ciphertext to IPFS using Pinata
 * This keeps the API key secure on the server side
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ipfs/upload
 * Uploads ciphertext to IPFS
 * Body: { ciphertext: string, filename?: string }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ciphertext, filename } = body;

        if (!ciphertext || typeof ciphertext !== 'string') {
            return NextResponse.json(
                { error: 'ciphertext is required and must be a string' },
                { status: 400 }
            );
        }

        // Get Pinata API key from environment (server-side only)
        const pinataApiKey = process.env.PINATA_API_KEY;
        const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

        if (!pinataApiKey || !pinataSecretApiKey) {
            return NextResponse.json(
                { error: 'Pinata API keys not configured. Please set PINATA_API_KEY and PINATA_SECRET_API_KEY in environment variables.' },
                { status: 500 }
            );
        }

        // Initialize Pinata SDK - @pinata/sdk v2 uses default export
        const pinataModule = await import('@pinata/sdk');
        // Try default export first, then check for named exports
        const PinataSDK = pinataModule.default || (pinataModule as any).PinataSDK;

        if (!PinataSDK || (typeof PinataSDK !== 'function' && typeof PinataSDK !== 'object')) {
            console.error('Available exports from @pinata/sdk:', Object.keys(pinataModule));
            throw new Error('PinataSDK is not a valid constructor. Available exports: ' + Object.keys(pinataModule).join(', '));
        }

        const pinata = new PinataSDK({
            pinataApiKey,
            pinataSecretApiKey,
        });

        // Create a Readable stream from ciphertext string for Node.js environment
        // Pinata SDK expects a Readable stream with proper EventEmitter methods
        const { Readable } = await import('stream');
        const buffer = Buffer.from(ciphertext, 'utf-8');

        // Create a proper Readable stream
        const stream = new Readable({
            read() {
                this.push(buffer);
                this.push(null); // End the stream
            }
        });

        // Pinata SDK expects the stream directly
        // Upload to IPFS - Pinata SDK v2 uses pinFileToIPFS method
        // Must provide pinataMetadata.name in options
        const result = await (pinata as any).pinFileToIPFS(stream, {
            pinataMetadata: {
                name: filename || 'arkana-tl-ciphertext.json',
            },
        });
        const cid = result.IpfsHash || result.ipfsHash || result.cid;

        return NextResponse.json({
            success: true,
            cid,
            gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
        });
    } catch (error) {
        console.error('IPFS upload error:', error);

        // Log detailed error information
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }

        // Check if it's a Pinata SDK error
        let errorMessage = 'Failed to upload to IPFS';
        if (error instanceof Error) {
            errorMessage = error.message;
            // Check for common Pinata errors
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                errorMessage = 'Pinata API authentication failed. Please check your API keys.';
            } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
                errorMessage = 'Pinata API access forbidden. Please check your API key permissions.';
            } else if (error.message.includes('429') || error.message.includes('rate limit')) {
                errorMessage = 'Pinata API rate limit exceeded. Please try again later.';
            }
        }

        return NextResponse.json(
            {
                error: 'Failed to upload to IPFS',
                message: errorMessage,
                details: error instanceof Error ? {
                    name: error.name,
                    message: error.message,
                } : undefined,
            },
            { status: 500 }
        );
    }
}

