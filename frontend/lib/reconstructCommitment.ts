'use client';

import { CommitmentState, CommitmentPoint } from './store';
import { pedersenCommitment5 } from './pedersen-commitments';
import { getSpendingKey, poseidonHash, reduceToBn254Field } from './circuit-utils';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from './abi/ArkanaConst';
import { PublicClient } from 'viem';

/**
 * Reconstruct a Pedersen commitment point from stored state
 * Matches the logic in circuits (spending_key = Hash3(Hash2(user_key, chain_id), token_address, signer_pubkey_hash)).
 *
 * Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
 * where m3 = spending_key, r = nonce_commitment.
 */
export async function reconstructCommitmentPoint(
    userKey: bigint,
    chainId: bigint,
    tokenAddress: bigint,
    signerPubkeyHash: bigint | string,
    shares: bigint,
    nullifier: bigint,
    unlocksAt: bigint,
    nonceCommitment: bigint
): Promise<CommitmentPoint> {
    const spendingKey = await getSpendingKey(userKey, chainId, tokenAddress, signerPubkeyHash);
    const commitmentPoint = pedersenCommitment5(shares, nullifier, spendingKey, unlocksAt, nonceCommitment);
    return { x: commitmentPoint.x, y: commitmentPoint.y };
}

/**
 * Compute commitment leaf from Pedersen commitment point.
 * When publicClient is provided, always uses the contract's computeCommitmentLeaf(x, y) so the leaf matches on-chain storage.
 * When no publicClient, uses JS poseidonHash (e.g. for tests).
 */
export async function computeCommitmentLeaf(
    commitmentPoint: CommitmentPoint,
    publicClient?: PublicClient
): Promise<bigint> {
    const x = reduceToBn254Field(commitmentPoint.x);
    const y = reduceToBn254Field(commitmentPoint.y);

    if (publicClient) {
        const contractLeaf = await publicClient.readContract({
            address: ArkanaAddress,
            abi: ArkanaAbi,
            functionName: 'computeCommitmentLeaf',
            args: [x, y],
        }) as bigint;
        return contractLeaf;
    }

    return poseidonHash([x, y]);
}

/**
 * Reconstruct commitment state from stored data.
 * spending_key = Hash3(Hash2(user_key, chain_id), token_address, signer_pubkey_hash) via getSpendingKey.
 */
export async function reconstructCommitmentStateFromBalanceEntry(
    userKey: bigint,
    chainId: bigint,
    tokenAddress: bigint,
    signerPubkeyHash: bigint | string,
    nonce: bigint,
    amount: bigint,
    previousState: CommitmentState | null,
    sharesFromContract?: bigint,
    sharesMinted?: bigint,
    publicClient?: PublicClient
): Promise<CommitmentState> {
    const spendingKey = await getSpendingKey(userKey, chainId, tokenAddress, signerPubkeyHash);
    const nonceCommitment = await poseidonHash([spendingKey, nonce, tokenAddress]);

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
        signerPubkeyHash,
        shares,
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

    // Compute commitment leaf using contract's Poseidon if available
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



