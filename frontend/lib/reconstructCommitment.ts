'use client';

import { CommitmentState, CommitmentPoint } from './store';
import { pedersenCommitment5 } from './pedersen-commitments';
import { poseidon2Hash } from '@aztec/foundation/crypto';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from './abi/ArkanaConst';
import { PublicClient } from 'viem';

/**
 * Reconstruct a Pedersen commitment point from stored state
 * Matches the logic in circuits/main/deposit/src/test/tests.nr
 * 
 * Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
 * where:
 *   m1 = shares
 *   m2 = nullifier
 *   m3 = spending_key (computed from user_key, chain_id, token_address)
 *   m4 = unlocks_at
 *   r = nonce_commitment
 */
export async function reconstructCommitmentPoint(
    userKey: bigint,
    chainId: bigint,
    tokenAddress: bigint,
    shares: bigint,
    nullifier: bigint,
    unlocksAt: bigint,
    nonceCommitment: bigint
): Promise<CommitmentPoint> {
    // Calculate spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3)
    const spendingKeyHash = await poseidon2Hash([userKey, chainId, tokenAddress]);
    let spendingKey: bigint;
    if (typeof spendingKeyHash === 'bigint') {
        spendingKey = spendingKeyHash;
    } else if ('toBigInt' in spendingKeyHash && typeof (spendingKeyHash as any).toBigInt === 'function') {
        spendingKey = (spendingKeyHash as any).toBigInt();
    } else if ('value' in spendingKeyHash) {
        spendingKey = BigInt((spendingKeyHash as any).value);
    } else {
        spendingKey = BigInt((spendingKeyHash as any).toString());
    }

    // Create Pedersen commitment: pedersen_commitment_5(shares, nullifier, spending_key, unlocks_at, nonce_commitment)
    const commitmentPoint = pedersenCommitment5(shares, nullifier, spendingKey, unlocksAt, nonceCommitment);

    return {
        x: commitmentPoint.x,
        y: commitmentPoint.y,
    };
}

/**
 * Compute commitment leaf from Pedersen commitment point
 * Uses the contract's Poseidon2 implementation to ensure consistency
 * Matches: poseidon2Hasher.hash_2(Field.toField(x), Field.toField(y))
 * @param commitmentPoint The commitment point with x and y coordinates
 * @param publicClient Optional PublicClient to call the contract. If not provided, falls back to JavaScript Poseidon2
 * @returns The leaf hash computed using the contract's Poseidon2
 */
export async function computeCommitmentLeaf(
    commitmentPoint: CommitmentPoint,
    publicClient?: PublicClient
): Promise<bigint> {
    // Always compute JavaScript Poseidon2 for comparison
    const jsLeafHash = await poseidon2Hash([commitmentPoint.x, commitmentPoint.y]);
    let jsLeaf: bigint;
    if (typeof jsLeafHash === 'bigint') {
        jsLeaf = jsLeafHash;
    } else if ('toBigInt' in jsLeafHash && typeof (jsLeafHash as any).toBigInt === 'function') {
        jsLeaf = (jsLeafHash as any).toBigInt();
    } else if ('value' in jsLeafHash) {
        jsLeaf = BigInt((jsLeafHash as any).value);
    } else {
        jsLeaf = BigInt((jsLeafHash as any).toString());
    }

    // If publicClient is provided, use the contract's computeCommitmentLeaf function
    // This ensures we use the same Huff Poseidon2 implementation as the contract
    if (publicClient) {
        try {
            const contractLeaf = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'computeCommitmentLeaf',
                args: [commitmentPoint.x, commitmentPoint.y],
            }) as bigint;

            // Compare JavaScript vs Contract (Huff) Poseidon2
            console.log('');
            console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
            console.log('║           🔬 POSEIDON2 HASH COMPARISON (JS vs Huff Contract)                  ║');
            console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
            console.log(`   Commitment Point:`);
            console.log(`     x: 0x${commitmentPoint.x.toString(16)}`);
            console.log(`     y: 0x${commitmentPoint.y.toString(16)}`);
            console.log('');
            console.log(`   JavaScript Poseidon2 (Aztec):`);
            console.log(`     0x${jsLeaf.toString(16)}`);
            console.log('');
            console.log(`   Contract Poseidon2 (Huff):`);
            console.log(`     0x${contractLeaf.toString(16)}`);
            console.log('');

            if (jsLeaf === contractLeaf) {
                console.log('   ✅ MATCH: Both implementations produce the same hash');
            } else {
                console.log('   ❌ MISMATCH: JavaScript and Huff Poseidon2 produce different hashes!');
                console.log(`   Difference: 0x${(jsLeaf > contractLeaf ? jsLeaf - contractLeaf : contractLeaf - jsLeaf).toString(16)}`);
            }
            console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
            console.log('');

            // Always use the contract's hash (Huff) to match what's stored on-chain
            return contractLeaf;
        } catch (error) {
            console.warn('⚠️ Failed to call contract computeCommitmentLeaf, falling back to JavaScript Poseidon2:', error);
            console.log('   Using JavaScript Poseidon2 hash: 0x' + jsLeaf.toString(16));
            // Fall through to JavaScript implementation
        }
    } else {
        console.log('⚠️ No publicClient provided, using JavaScript Poseidon2 (may not match contract):');
        console.log('   Hash: 0x' + jsLeaf.toString(16));
    }

    return jsLeaf;
}

/**
 * Reconstruct commitment state from stored data
 * This is used when we have balance entries but need to reconstruct the full commitment state
 * 
 * @param sharesFromContract Optional shares calculated from contract (for nonce 0, the contract adds shares*G to the commitment point)
 */
export async function reconstructCommitmentStateFromBalanceEntry(
    userKey: bigint,
    chainId: bigint,
    tokenAddress: bigint,
    nonce: bigint,
    amount: bigint, // This is the decrypted balance amount
    previousState: CommitmentState | null, // Previous commitment state (for shares, nullifier, unlocks_at)
    sharesFromContract?: bigint, // Optional shares from contract (for nonce 0, contract adds shares*G before hashing)
    sharesMinted?: bigint, // Optional shares minted for this nonce (for nonce > 0 that are Deposit operations, contract adds shares*G before hashing)
    publicClient?: PublicClient // Optional PublicClient to use contract's Poseidon2 for leaf computation
): Promise<CommitmentState> {
    // Calculate nonce commitment: Poseidon2::hash([spending_key, nonce, token_address], 3)
    const spendingKeyHash = await poseidon2Hash([userKey, chainId, tokenAddress]);
    let spendingKey: bigint;
    if (typeof spendingKeyHash === 'bigint') {
        spendingKey = spendingKeyHash;
    } else if ('toBigInt' in spendingKeyHash && typeof (spendingKeyHash as any).toBigInt === 'function') {
        spendingKey = (spendingKeyHash as any).toBigInt();
    } else if ('value' in spendingKeyHash) {
        spendingKey = BigInt((spendingKeyHash as any).value);
    } else {
        spendingKey = BigInt((spendingKeyHash as any).toString());
    }

    const nonceCommitmentHash = await poseidon2Hash([spendingKey, nonce, tokenAddress]);
    let nonceCommitment: bigint;
    if (typeof nonceCommitmentHash === 'bigint') {
        nonceCommitment = nonceCommitmentHash;
    } else if ('toBigInt' in nonceCommitmentHash && typeof (nonceCommitmentHash as any).toBigInt === 'function') {
        nonceCommitment = (nonceCommitmentHash as any).toBigInt();
    } else if ('value' in nonceCommitmentHash) {
        nonceCommitment = BigInt((nonceCommitmentHash as any).value);
    } else {
        nonceCommitment = BigInt((nonceCommitmentHash as any).toString());
    }

    // CRITICAL UNDERSTANDING:
    // For nonce 0 (entry):
    // - Entry circuit creates: pedersen_commitment_5(0, 0, spending_key, 0, nonce_commitment)
    // - Contract adds: shares*G + unlocks_at*K to get finalCommitment
    // - Contract saves: leaf = hash(finalCommitment)
    //
    // For deposit circuit verification:
    // - Circuit computes: pedersen_commitment_5(previous_shares, nullifier, spending_key, previous_unlocks_at, previous_nonce_commitment)
    // - Circuit computes: leaf = hash(commitment_point)
    // - Circuit verifies: computed_leaf == previous_commitment_leaf
    //
    // So for nonce 0, to match what the contract saved:
    // - We need to pass previous_shares = shares (the shares the contract added)
    // - NOT 0! Because the contract saved hash(pedersen_commitment_5(0,0,spending_key,0,nonce_commitment) + shares*G + unlocks_at*K)
    // - Which equals hash(pedersen_commitment_5(shares, 0, spending_key, unlocks_at, nonce_commitment)) if we include shares in the commitment
    //
    // Actually wait - that's not right. The contract does:
    // balanceCommitment = pedersen_commitment_5(0, 0, spending_key, 0, nonce_commitment)  [from entry circuit]
    // finalCommitment = balanceCommitment + shares*G + unlocks_at*K
    // leaf = hash(finalCommitment)
    //
    // But the deposit circuit expects:
    // commitment_point = pedersen_commitment_5(previous_shares, nullifier, spending_key, previous_unlocks_at, previous_nonce_commitment)
    // leaf = hash(commitment_point)
    //
    // These are NOT the same! The contract adds shares*G AFTER computing the commitment, but the circuit includes shares IN the commitment.
    //
    // So for nonce 0, we need to pass previous_shares = shares so that:
    // pedersen_commitment_5(shares, 0, spending_key, 0, nonce_commitment) = pedersen_commitment_5(0, 0, spending_key, 0, nonce_commitment) + shares*G
    // This is true because pedersen_commitment_5(shares, 0, spending_key, 0, nonce_commitment) = 0*G + 0*H + spending_key*D + 0*K + nonce_commitment*J + shares*G
    // = pedersen_commitment_5(0, 0, spending_key, 0, nonce_commitment) + shares*G
    //
    // YES! So for nonce 0, we pass previous_shares = sharesFromContract

    // CRITICAL: For nonce 0, use sharesFromContract. For nonce > 0, use amount (which is previous_shares decrypted from encryptedBalance)
    // The amount parameter is the decrypted previous_shares for nonce > 0, not the total!
    const shares = sharesFromContract !== undefined && nonce === BigInt(0)
        ? sharesFromContract
        : amount; // For nonce > 0, amount is previous_shares (decrypted from encryptedBalance)
    const nullifier = previousState ? previousState.nullifier : BigInt(0);
    const unlocksAt = previousState ? previousState.unlocksAt : BigInt(0);

    // DEBUG: Log inputs and computed values
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║           reconstructCommitmentStateFromBalanceEntry DEBUG                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
    console.log(`   nonce: ${nonce.toString()}`);
    console.log(`   amount (parameter): ${amount.toString()}`);
    console.log(`   sharesFromContract: ${sharesFromContract?.toString() ?? 'undefined'}`);
    console.log(`   sharesMinted: ${sharesMinted?.toString() ?? 'undefined'}`);
    console.log(`   --> shares (used for pedersen_commitment_5 m1): ${shares.toString()}`);
    console.log(`   --> nullifier: ${nullifier.toString()}`);
    console.log(`   --> unlocksAt: ${unlocksAt.toString()}`);
    console.log('');
    if (nonce > BigInt(0) && sharesMinted !== undefined && sharesMinted > BigInt(0)) {
        console.log(`   ⚠️ WARNING: sharesMinted=${sharesMinted.toString()} passed for nonce > 0`);
        console.log(`   ⚠️ This will add ${sharesMinted.toString()}*G to the commitment, causing DOUBLE-COUNTING`);
        console.log(`   ⚠️ if the 'amount' parameter already includes the minted shares!`);
        console.log('');
    }

    // Reconstruct commitment point using the shares that match what the contract saved
    // For nonce 0: pedersen_commitment_5(shares, 0, spending_key, 0, nonce_commitment) 
    //   This equals: pedersen_commitment_5(0, 0, spending_key, 0, nonce_commitment) + shares*G
    //   Which is what the contract saved!
    // For nonce > 0: pedersen_commitment_5(previous_shares, nullifier, spending_key, unlocks_at, nonce_commitment)
    const commitmentPoint = await reconstructCommitmentPoint(
        userKey,
        chainId,
        tokenAddress,
        shares, // For nonce 0, this is sharesFromContract (the shares the contract added)
        nullifier,
        unlocksAt,
        nonceCommitment
    );

    let finalCommitmentPoint = commitmentPoint;

    // CRITICAL: For nonce > 0 that are Deposit operations, the contract adds shares*G to the commitment point
    // before hashing. We need to do the same to reconstruct the correct leaf.
    if (sharesMinted !== undefined && sharesMinted > BigInt(0) && nonce > BigInt(0)) {
        // Import grumpkin operations
        const pedersenModule = await import('./pedersen-commitments');
        const { grumpkinMul, grumpkinAdd } = pedersenModule;
        const GENERATOR_G = pedersenModule.GENERATOR_G;

        // Add sharesMinted*G to the commitment point
        const sharesCommitment = grumpkinMul(GENERATOR_G, sharesMinted);
        finalCommitmentPoint = grumpkinAdd(finalCommitmentPoint, sharesCommitment);

        console.log(`   Added sharesMinted*G (${sharesMinted.toString()} shares) to commitment point for nonce ${nonce.toString()}`);
    }

    // Compute commitment leaf using contract's Poseidon2 if available
    const commitmentLeaf = await computeCommitmentLeaf(finalCommitmentPoint, publicClient);

    // Compute shares for return value
    const returnedShares = sharesFromContract !== undefined ? sharesFromContract : shares;

    console.log(`   --> RETURNED shares: ${returnedShares.toString()}`);
    console.log(`   --> RETURNED commitmentLeaf: 0x${commitmentLeaf.toString(16)}`);
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    return {
        nonce,
        tokenAddress,
        commitmentPoint: finalCommitmentPoint,
        commitmentLeaf,
        nonceCommitment,
        shares: returnedShares,
        nullifier,
        unlocksAt,
        chainId,
    };
}



