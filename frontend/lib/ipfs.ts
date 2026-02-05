/**
 * IPFS utilities using Pinata via API route
 * The API key is kept secure on the server side
 */

/**
 * Upload ciphertext to IPFS via API route
 * @param ciphertext Ciphertext string to upload
 * @param orderIndex Optional order index for filename
 * @returns IPFS CID
 */
export async function uploadCiphertextToIPFS(ciphertext: string, orderIndex?: number): Promise<string> {
    const filename = orderIndex !== undefined
        ? `arkana-tl-order-${orderIndex + 1}.json`
        : 'arkana-tl-ciphertext.json';

    try {
        const response = await fetch('/api/ipfs/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ciphertext,
                filename,
            }),
        });

        if (!response.ok) {
            // Try to parse as JSON, but handle HTML error pages
            let errorMessage = 'Failed to upload to IPFS';
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                try {
                    const error = await response.json();
                    errorMessage = error.message || error.error || errorMessage;
                } catch (e) {
                    // If JSON parsing fails, use status text
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
            } else {
                // Response is not JSON (probably HTML error page)
                const text = await response.text();
                console.error('Non-JSON error response:', text.substring(0, 200));
                errorMessage = `HTTP ${response.status}: ${response.statusText}. Server returned non-JSON response.`;
            }
            
            throw new Error(errorMessage);
        }

        const result = await response.json();
        const cid = result.cid;

        console.log(`✅ Uploaded to IPFS: ${cid}`);
        console.log(`   Gateway URL: ${result.gatewayUrl}`);

        return cid;
    } catch (error) {
        console.error('❌ Failed to upload to IPFS:', error);
        throw error;
    }
}

/**
 * Get IPFS gateway URL from CID
 * @param cid IPFS CID
 * @returns Gateway URL (using Pinata gateway)
 */
export function getIPFSGatewayURL(cid: string): string {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
}
