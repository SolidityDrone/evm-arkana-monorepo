// timelock-order.js
// Creates timelocked encrypted swap orders with nested encryption chain

import { bn254 } from '@noble/curves/bn254.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hexToBytes, randomBytes } from '@noble/curves/utils.js';
import { webcrypto } from 'node:crypto';
import { createCipheriv, createDecipheriv } from 'node:crypto';
import { poseidon2Hash } from '@aztec/foundation/crypto';

// Set up crypto.getRandomValues for Node.js
if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = webcrypto;
}

// Drand beacon config (evmnet chain - uses BN254)
const BEACON_ID = 'evmnet';
const DRAND_PUBKEY_HEX = '07e1d1d335df83fa98462005690372c643340060d205306a9aa8106b6bd0b3820557ec32c2ad488e4d4f6008f89a346f18492092ccc0d594610de2732c8b808f0095685ae3a85ba243747b1b2f426049010f6b73a0cf1d389351d5aaaa1047f6297d3a4f9749b33eb2d904c9d9ebf17224150ddd7abd7567a9bec6c74480ee0b';
const GENESIS_TIME = 1727521075;
const PERIOD = 3;

/**
 * Get current dRand round
 */
function getCurrentRound() {
    const now = Math.floor(Date.now() / 1000);
    if (now < GENESIS_TIME) return 0;
    return Math.floor((now - GENESIS_TIME) / PERIOD);
}

/**
 * Get round timestamp
 */
function getRoundTimestamp(round) {
    return GENESIS_TIME + (round * PERIOD);
}

/**
 * Hash to G1 point (BN254) - simplified version using try-and-increment
 * In production, use proper hash-to-curve
 */
function hashToG1(message) {
    const G1 = bn254.G1;
    const Fp = bn254.fields.Fp;
    const p = Fp.ORDER; // BN254 field modulus

    // BN254 curve: y^2 = x^3 + 3
    const b = 3n;

    // Hash message to get initial x coordinate
    let messageHash = sha256(message);
    let x = BigInt('0x' + Buffer.from(messageHash).toString('hex')) % p;

    // Try-and-increment: find a valid point
    for (let i = 0n; i < 256n; i++) {
        // Compute y^2 = x^3 + 3
        const x3 = (x * x % p) * x % p;
        const y2 = (x3 + b) % p;

        // Check if y^2 is a quadratic residue
        const exp = (p - 1n) / 2n;
        const legendre = modPow(y2, exp, p);

        if (legendre === 1n) {
            // y^2 is a quadratic residue, compute y
            const y = modPow(y2, (p + 1n) / 4n, p);

            // Create uncompressed point format
            const xHex = x.toString(16).padStart(64, '0');
            const yHex = y.toString(16).padStart(64, '0');
            const pointHex = '04' + xHex + yHex;

            try {
                const point = G1.Point.fromHex(pointHex);
                return point;
            } catch (e) {
                // Point not on curve, try next x
            }
        }

        // Increment x and try again
        x = (x + 1n) % p;
    }

    throw new Error('Failed to hash to G1 after 256 attempts');
}

// Helper: Modular exponentiation
function modPow(base, exp, mod) {
    let result = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) {
            result = (result * base) % mod;
        }
        exp = exp / 2n;
        base = (base * base) % mod;
    }
    return result;
}

/**
 * KDF from pairing result (Fp12 element) - same as timelock-prep.js
 * Uses Poseidon2 to match Noir circuit implementation
 */
async function kdf(pairingResult) {
    const pairingStr = JSON.stringify({
        c0: pairingResult.c0.toString(),
        c1: pairingResult.c1.toString()
    });
    const pairingHash = sha256(new TextEncoder().encode(pairingStr));
    const pairingFieldRaw = BigInt('0x' + Buffer.from(pairingHash).toString('hex'));
    
    // Aztec Fr field modulus (same as Noir)
    const FR_MODULUS = BigInt('0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001');
    const pairingField = pairingFieldRaw % FR_MODULUS;
    
    // Use Poseidon2 hash (same as Noir circuit)
    const fields = [pairingField];
    const kdfResult = await poseidon2Hash(fields);
    return kdfResult.toBigInt();
}

/**
 * Derive AES-128 key from pairing result
 * @param pairingResult Pairing result (Fp12 element from e(V, drandPubkey))
 * @returns AES-128 key (16 bytes)
 */
async function deriveAESKey(pairingResult) {
    // Use KDF to get a field value, then hash to 16 bytes
    const kdfValue = await kdf(pairingResult);
    const kdfBytes = Buffer.from(kdfValue.toString(16).padStart(64, '0'), 'hex');
    const keyHash = sha256(kdfBytes);
    return new Uint8Array(keyHash.slice(0, 16)); // 16 bytes for AES-128
}

/**
 * Encrypt data with AES-128-CBC
 * @param data Data to encrypt (string)
 * @param key AES-128 key (16 bytes)
 * @returns {iv, ciphertext} as hex strings
 */
function encryptAES128(data, key) {
    const iv = Buffer.from(randomBytes(16));
    const cipher = createCipheriv('aes-128-cbc', Buffer.from(key), iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
        iv: iv.toString('hex'),
        ciphertext: encrypted
    };
}

/**
 * Decrypt data with AES-128-CBC
 * @param ciphertext Encrypted data (hex string)
 * @param key AES-128 key (16 bytes)
 * @param iv Initialization vector (hex string)
 * @returns Decrypted data as string
 */
function decryptAES128(ciphertext, key, iv) {
    const decipher = createDecipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

/**
 * Parse dRand public key (G2 point on BN254)
 */
function parseDrandPubkey() {
    const G2 = bn254.G2;
    const pubkeyX0Hex = DRAND_PUBKEY_HEX.substring(0, 64);
    const pubkeyX1Hex = DRAND_PUBKEY_HEX.substring(64, 128);
    const pubkeyY0Hex = DRAND_PUBKEY_HEX.substring(128, 192);
    const pubkeyY1Hex = DRAND_PUBKEY_HEX.substring(192, 256);
    
    // Try different coordinate orderings (same as timelock-prep.js)
    const orderings = [
        { name: 'x0,x1,y0,y1', hex: '04' + pubkeyX0Hex + pubkeyX1Hex + pubkeyY0Hex + pubkeyY1Hex },
        { name: 'x1,x0,y1,y0', hex: '04' + pubkeyX1Hex + pubkeyX0Hex + pubkeyY1Hex + pubkeyY0Hex },
        { name: 'y1,y0,x1,x0', hex: '04' + pubkeyY1Hex + pubkeyY0Hex + pubkeyX1Hex + pubkeyX0Hex },
        { name: 'y0,y1,x0,x1', hex: '04' + pubkeyY0Hex + pubkeyY1Hex + pubkeyX0Hex + pubkeyX1Hex },
    ];
    
    for (const ordering of orderings) {
        try {
            const drandPubkey = G2.Point.fromHex(ordering.hex);
            return drandPubkey;
        } catch (e) {
            // Continue to next ordering
        }
    }
    
    throw new Error('Could not parse drand pubkey as G2 point');
}

/**
 * Create timelock encryption for a round using real dRand pairing
 * @param plaintext Plaintext to encrypt (JSON string)
 * @param targetRound Target dRand round
 * @returns {ciphertext, V, C1, H, pairingResult} for verification
 */
async function createTimelockEncryption(plaintext, targetRound) {
    const G2 = bn254.G2;
    const Fr = bn254.fields.Fr;
    
    // Generate random r (must be in scalar field)
    const rRaw = BigInt('0x' + Buffer.from(randomBytes(32)).toString('hex'));
    const r = Fr.create(rRaw % Fr.ORDER);
    
    // Hash round to G1: H = hash_to_curve(round)
    const roundBytes = new TextEncoder().encode(targetRound.toString());
    const H = hashToG1(roundBytes);
    
    // V = r * H (on G1)
    const V = H.multiply(r);
    
    // C1 = r * G2_gen (on G2) - needed for on-chain pairing verification
    const C1 = G2.Point.BASE.multiply(r);
    
    // Parse dRand public key (G2 point)
    const drandPubkey = parseDrandPubkey();
    
    // Pairing: e(V, drandPubkey) - this is the shared secret
    const pairingResult = bn254.pairing(V, drandPubkey);
    
    // Get C1 affine coordinates (G2 point has Fp2 coordinates)
    const C1_affine = C1.toAffine();
    
    return {
        V: { x: V.x.toString(), y: V.y.toString() },
        C1: {
            x0: C1_affine.x.c0.toString(),
            x1: C1_affine.x.c1.toString(),
            y0: C1_affine.y.c0.toString(),
            y1: C1_affine.y.c1.toString()
        },
        H: { x: H.x.toString(), y: H.y.toString() },
        targetRound,
        pairingResult // Store for deriving ChaCha key
    };
}

/**
 * Create nested encryption chain for sequential orders
 * @param orders Array of order objects: [{amountIn, amountOutMin, slippageBps, deadline, recipient, tokenOut, executionFeeBps}, ...]
 * @param startRound Starting dRand round
 * @param roundStep Step between rounds (e.g., 1000)
 * @returns Array of encrypted orders with nested ciphertexts
 */
async function createOrderChain(orders, startRound, roundStep = 1000) {
    const encryptedOrders = [];
    
    // Start from the last order and work backwards
    // Each order contains the ciphertext of the next order
    for (let i = orders.length - 1; i >= 0; i--) {
        const order = orders[i];
        const round = startRound + (i * roundStep);
        
        // Create order JSON
        // Note: sharesAmount is encrypted (amount of shares to withdraw from Arkana)
        // amountOutMin is the target output amount for the swap
        const orderData = {
            sharesAmount: order.sharesAmount?.toString() || '0',
            amountOutMin: order.amountOutMin?.toString() || '0',
            slippageBps: order.slippageBps || 0,
            deadline: order.deadline || 0,
            recipient: order.recipient || '',
            tokenOut: order.tokenOut || '',
            executionFeeBps: order.executionFeeBps || 0
        };
        
        // If this is not the last order, include the next order's ciphertext
        let plaintext;
        if (i < orders.length - 1) {
            // Include next order's encrypted data (already encrypted in previous iteration)
            const nextOrder = encryptedOrders[0]; // Last encrypted (first in reverse order)
            plaintext = JSON.stringify({
                ...orderData,
                nextCiphertext: nextOrder.fullCiphertext // Include nested ciphertext
            });
        } else {
            // Last order in chain - no next ciphertext
            plaintext = JSON.stringify(orderData);
        }
        
        // Create timelock encryption (uses real dRand pairing)
        const timelock = await createTimelockEncryption(plaintext, round);
        
        // Derive AES-128 key from pairing result
        const aesKey = await deriveAESKey(timelock.pairingResult);
        
        // Encrypt order data with AES-128-CBC
        const aesEncrypted = encryptAES128(plaintext, aesKey);
        
        // Full ciphertext for contract registration (AES-128-CBC encrypted JSON)
        // This is what gets registered on-chain
        const fullCiphertext = JSON.stringify({
            aes: aesEncrypted, // AES-128-CBC encrypted data
            round,
            // Include timelock proof data for on-chain verification
            timelock: {
                H: timelock.H,
                V: timelock.V,
                C1: timelock.C1,
                targetRound: timelock.targetRound
            }
        });
        
        const encryptedOrder = {
            round,
            roundTimestamp: getRoundTimestamp(round),
            orderData,
            timelock,
            aes: aesEncrypted,
            fullCiphertext,
            hasNextCiphertext: i < orders.length - 1
        };
        
        // Add to beginning (since we're working backwards)
        encryptedOrders.unshift(encryptedOrder);
    }
    
    return encryptedOrders;
}

/**
 * Decrypt order from chain (when round is available)
 * @param encryptedOrder Encrypted order object
 * @param drandSignature dRand signature for the round (G1 point)
 * @returns Decrypted order data and next ciphertext if available
 */
function decryptOrder(encryptedOrder, drandSignature) {
    // Derive AES key from signature
    const aesKey = deriveAESKey(drandSignature);
    
    // Decrypt AES-encrypted data
    const decrypted = decryptAES128(encryptedOrder.aes.ciphertext, Buffer.from(aesKey), encryptedOrder.aes.iv);
    const orderData = JSON.parse(decrypted);
    
    return {
        ...orderData,
        round: encryptedOrder.round
    };
}

/**
 * Main function to create order chain
 */
async function main() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║      TIMELOCK ORDER CHAIN CREATOR                           ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    
    // Example: Create 4 orders unlocking at rounds x, x+1000, x+2000, x+3000
    const currentRound = getCurrentRound();
    const startRound = currentRound + 1000; // Start 1000 rounds in the future
    const roundStep = 1000;
    
    console.log(`Current round: ${currentRound}`);
    console.log(`Starting round: ${startRound}`);
    console.log(`Round step: ${roundStep}`);
    console.log('');
    
    // Example orders
    // Note: sharesAmount is in shares (from Arkana vault), amountOutMin is target output
    const orders = [
        {
            sharesAmount: '1000000', // 1M shares (will be converted to tokens by vault)
            amountOutMin: '950000000000000000', // Target: 0.95 WETH (18 decimals)
            slippageBps: 50, // 0.5%
            deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
            recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
            executionFeeBps: 10 // 0.1%
        },
        {
            sharesAmount: '2000000', // 2M shares
            amountOutMin: '1900000000000000000', // Target: 1.9 WETH
            slippageBps: 50,
            deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
            recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            executionFeeBps: 10
        },
        {
            sharesAmount: '3000000', // 3M shares
            amountOutMin: '2850000000000000000', // Target: 2.85 WETH
            slippageBps: 50,
            deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
            recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            executionFeeBps: 10
        },
        {
            sharesAmount: '4000000', // 4M shares
            amountOutMin: '3800000000000000000', // Target: 3.8 WETH
            slippageBps: 50,
            deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
            recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            executionFeeBps: 10
        }
    ];
    
    console.log('Creating order chain...');
    console.log(`Number of orders: ${orders.length}`);
    console.log('');
    
    const encryptedOrders = await createOrderChain(orders, startRound, roundStep);
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('ENCRYPTED ORDER CHAIN');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    
    encryptedOrders.forEach((order, index) => {
        console.log(`Order ${index + 1}:`);
        console.log(`  Round: ${order.round}`);
        console.log(`  Round Timestamp: ${new Date(order.roundTimestamp * 1000).toISOString()}`);
        console.log(`  Shares Amount: ${order.orderData.sharesAmount}`);
        console.log(`  Amount Out Min (target): ${order.orderData.amountOutMin}`);
        console.log(`  Token Out: ${order.orderData.tokenOut}`);
        console.log(`  Recipient: ${order.orderData.recipient}`);
        console.log(`  Slippage: ${order.orderData.slippageBps} bps`);
        console.log(`  Deadline: ${new Date(parseInt(order.orderData.deadline) * 1000).toISOString()}`);
        console.log(`  Execution Fee: ${order.orderData.executionFeeBps} bps`);
        console.log(`  Has Next Ciphertext: ${order.hasNextCiphertext ? 'Yes' : 'No'}`);
        console.log(`  Full Ciphertext (hex): ${order.fullCiphertext.substring(0, 100)}...`);
        console.log('');
    });
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('CIPHERTEXT FOR CONTRACT REGISTRATION');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('NOTE: Only register the FIRST ciphertext (Order 1).');
    console.log('      It contains all subsequent orders in a nested encryption chain.');
    console.log('      When Order 1 is decrypted at its round, it reveals Order 2, and so on.');
    console.log('');
    
    // Only print the first order's ciphertext (contains all others nested)
    const firstOrder = encryptedOrders[0];
    const ciphertextHex = Buffer.from(firstOrder.fullCiphertext, 'utf8').toString('hex');
    const ciphertextBytes = Buffer.from(firstOrder.fullCiphertext, 'utf8').length;
    
    console.log('// First Order (Round ' + firstOrder.round + ') - Contains entire chain');
    console.log(`// Ciphertext size: ${ciphertextBytes} bytes (${(ciphertextBytes / 1024).toFixed(2)} KB)`);
    console.log('bytes memory ciphertext = hex"' + ciphertextHex + '";');
    console.log('registerEncryptedOrder(ciphertext);');
    console.log('');
    console.log('Chain structure:');
    console.log('  Order 1 (Round ' + firstOrder.round + ') -> contains Order 2');
    if (encryptedOrders.length > 1) {
        console.log('  Order 2 (Round ' + encryptedOrders[1].round + ') -> contains Order 3');
    }
    if (encryptedOrders.length > 2) {
        console.log('  Order 3 (Round ' + encryptedOrders[2].round + ') -> contains Order 4');
    }
    if (encryptedOrders.length > 3) {
        console.log('  Order 4 (Round ' + encryptedOrders[3].round + ') -> no next (last in chain)');
    }
    console.log('');
    
    console.log('✅ Order chain created successfully!');
    console.log('');
    console.log('✅ Order chain created using real dRand evmnet pairing!');
    console.log('   Encryption: AES-128-CBC (16 bytes IV overhead)');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { createOrderChain, decryptOrder, getCurrentRound, getRoundTimestamp };

