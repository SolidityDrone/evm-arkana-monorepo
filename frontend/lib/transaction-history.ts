import { PublicClient, Address } from 'viem';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from '@/lib/abi/ArkanaConst';
import { poseidonCtrDecrypt } from '@/lib/poseidon-ctr-encryption';
import { padHex } from 'viem';
import { getSpendingKey, poseidonHash } from './circuit-utils';

// VIEW_STRING constant from circuits: 0x76696577696e675f6b6579 ("viewing_key" in hex)
const VIEW_STRING = BigInt('0x76696577696e675f6b6579');

export interface TransactionHistoryEntry {
  type: 'initialize' | 'deposit' | 'send' | 'withdraw' | 'absorb';
  nonce: bigint;
  nonceCommitment: bigint;
  tokenAddress: bigint;
  amount: bigint; // Decrypted balance (in shares)
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: string;
  // Additional fields based on transaction type
  receiverPublicKey?: { x: bigint; y: bigint };
  absorbedAmount?: bigint;
  nullifier?: bigint;
  sharesMinted?: bigint;
}

/**
 * Derive viewkey from user_key (Poseidon via circuit-utils)
 */
export async function deriveViewKey(userKey: bigint): Promise<bigint> {
  return poseidonHash([VIEW_STRING, userKey]);
}

/**
 * Compute spending_key for a token (4 args: user_key, chain_id, token_address, signer_pubkey_hash)
 */
export async function computeSpendingKey(
  userKey: bigint,
  chainId: bigint,
  tokenAddress: bigint,
  signerPubkeyHash: bigint | string
): Promise<bigint> {
  return getSpendingKey(userKey, chainId, tokenAddress, signerPubkeyHash);
}

/**
 * Compute nonce commitment (spending_key = 4 args)
 */
export async function computeNonceCommitment(
  userKey: bigint,
  chainId: bigint,
  tokenAddress: bigint,
  signerPubkeyHash: bigint | string,
  nonce: bigint
): Promise<bigint> {
  const spendingKey = await getSpendingKey(userKey, chainId, tokenAddress, signerPubkeyHash);
  return poseidonHash([spendingKey, nonce, tokenAddress]);
}

/**
 * Reconstruct transaction history for a specific token
 * Only returns ENTRY (initialize), DEPOSIT, and WITHDRAW operations
 * 
 * @param publicClient The public client
 * @param userKey The user's private key
 * @param tokenAddress The token address to get history for
 * @param currentNonce The current nonce for this token
 * @param onEntryFound Optional callback for progressive loading
 */
export async function reconstructTokenHistory(
  publicClient: PublicClient,
  userKey: bigint,
  tokenAddress: Address,
  currentNonce: bigint,
  onEntryFound?: (entry: TransactionHistoryEntry) => void
): Promise<TransactionHistoryEntry[]> {
  const viewKey = await deriveViewKey(userKey);
  const history: TransactionHistoryEntry[] = [];
  const { getSignerIdentityFromUserKey } = await import('@/lib/eddsa-circuit');
  const signerIdentity = await getSignerIdentityFromUserKey(userKey);
  const signerPubkeyHash = BigInt(signerIdentity.signer_pubkey_hash);

  const chainId = BigInt(await publicClient.getChainId());
  const tokenAddressBigInt = BigInt(tokenAddress);

  try {
    console.log(`[History] Reconstructing history for token ${tokenAddress}, current nonce: ${currentNonce.toString()}`);

    const lastUsedNonce = currentNonce > BigInt(0) ? currentNonce - BigInt(1) : BigInt(0);
    console.log(`[History] Processing nonces 0 to ${lastUsedNonce.toString()} for token ${tokenAddress}`);
    
    for (let nonce = BigInt(0); nonce <= lastUsedNonce; nonce++) {
      try {
        console.log(`[History] Checking nonce ${nonce.toString()}...`);
        const nonceCommitment = await computeNonceCommitment(userKey, chainId, tokenAddressBigInt, signerPubkeyHash, nonce);
        const nonceCommitmentBytes32 = padHex(`0x${nonceCommitment.toString(16)}`, { size: 32 }) as `0x${string}`;

        // Check if this nonceCommitment exists in the contract
        const exists = await publicClient.readContract({
          address: ArkanaAddress,
          abi: ArkanaAbi,
          functionName: 'usedCommitments',
          args: [nonceCommitmentBytes32],
        }) as boolean;

        if (!exists) {
          console.log(`[History] Nonce ${nonce.toString()}: not found in usedCommitments, skipping`);
          continue;
        }

        console.log(`[History] Nonce ${nonce.toString()}: found, fetching info...`);

        // Get operation info and encrypted state from contract
        let [operationType, sharesMinted, opTokenAddress, encryptedBalanceBytes32, encryptedNullifierBytes32] = 
          await publicClient.readContract({
            address: ArkanaAddress,
            abi: ArkanaAbi,
            functionName: 'getNonceCommitmentInfo',
            args: [nonceCommitmentBytes32],
          }) as [number, bigint, string, `0x${string}`, `0x${string}`];

        // Verify token address matches
        const opTokenAddressBigInt = BigInt(opTokenAddress);
        if (opTokenAddressBigInt !== tokenAddressBigInt && opTokenAddressBigInt !== BigInt(0)) {
          console.log(`[History] Token mismatch: expected ${tokenAddressBigInt.toString(16)}, got ${opTokenAddressBigInt.toString(16)}, skipping`);
          continue;
        }

        // Map operation type
        // Special case: nonce 0 is always initialize
        let transactionType: 'initialize' | 'deposit' | 'send' | 'withdraw' | 'absorb';
        if (nonce === BigInt(0)) {
          transactionType = 'initialize';
        } else {
          switch (operationType) {
            case 0:
              transactionType = 'initialize';
              break;
            case 1:
              transactionType = 'deposit';
              break;
            case 2:
              transactionType = 'send';
              break;
            case 3:
              transactionType = 'withdraw';
              break;
            case 4:
              transactionType = 'absorb';
              break;
            default:
              transactionType = 'deposit';
          }
        }

        // Filter: Only include ENTRY (initialize), DEPOSIT, and WITHDRAW
        if (transactionType !== 'initialize' && transactionType !== 'deposit' && transactionType !== 'withdraw') {
          console.log(`[History] Skipping ${transactionType} operation (only showing initialize/deposit/withdraw)`);
          continue;
        }

        // Decrypt balance
        const encryptedBalance = BigInt(encryptedBalanceBytes32);
        let amount: bigint;

        if (nonce === BigInt(0)) {
          // For nonce 0 (initialize), balance is stored as plaintext
          amount = encryptedBalance;
          if (sharesMinted === BigInt(0) && amount > BigInt(0)) {
            sharesMinted = amount;
          }
        } else {
          // For other nonces, decrypt using view_key
          amount = await poseidonCtrDecrypt(encryptedBalance, viewKey, 0);
        }

        // Try to get transaction hash and block number
        let transactionHash = '';
        let blockNumber = BigInt(0);
        let timestamp = BigInt(0);

        try {
          const latestBlock = await publicClient.getBlockNumber();
          const searchBlocks = 10000;
          const fromBlockNum = latestBlock > BigInt(searchBlocks) ? latestBlock - BigInt(searchBlocks) : BigInt(0);
          
          const nonceCommitmentHex = `0x${nonceCommitment.toString(16).padStart(64, '0')}`;
          const nonceCommitmentHexNoPrefix = nonceCommitmentHex.slice(2).toLowerCase();
          
          let foundBlock: bigint | null = null;
          for (let blockNum = latestBlock; blockNum >= fromBlockNum && blockNum > BigInt(0); blockNum -= BigInt(50)) {
            try {
              const block = await publicClient.getBlock({ blockNumber: blockNum, includeTransactions: true }).catch(() => null);
              if (!block || !block.transactions) continue;

              for (const tx of block.transactions) {
                if (typeof tx === 'string') continue;
                if (tx.to?.toLowerCase() !== ArkanaAddress.toLowerCase()) continue;
                if (!tx.input || !tx.input.toLowerCase().includes(nonceCommitmentHexNoPrefix)) continue;

                foundBlock = blockNum;
                break;
              }

              if (foundBlock) break;
            } catch (blockError) {
              continue;
            }
          }

          if (foundBlock) {
            const searchStart = foundBlock > BigInt(50) ? foundBlock - BigInt(50) : BigInt(0);
            const searchEnd = foundBlock + BigInt(50);
            
            for (let blockNum = searchEnd; blockNum >= searchStart && blockNum > BigInt(0); blockNum--) {
              try {
                const block = await publicClient.getBlock({ blockNumber: blockNum, includeTransactions: true }).catch(() => null);
                if (!block || !block.transactions) continue;

                for (const tx of block.transactions) {
                  if (typeof tx === 'string') continue;
                  if (tx.to?.toLowerCase() !== ArkanaAddress.toLowerCase()) continue;
                  if (!tx.input || !tx.input.toLowerCase().includes(nonceCommitmentHexNoPrefix)) continue;

                  const receipt = await publicClient.getTransactionReceipt({ hash: tx.hash }).catch(() => null);
                  if (!receipt || receipt.status !== 'success') continue;

                  transactionHash = tx.hash;
                  blockNumber = BigInt(block.number);
                  timestamp = BigInt(block.timestamp);
                  break;
                }

                if (transactionHash) break;
              } catch (blockError) {
                continue;
              }
            }
          }
        } catch (error) {
          console.warn(`[History] Could not find transaction hash for nonce ${nonce.toString()}:`, error);
        }

        // Create entry
        const entry: TransactionHistoryEntry = {
          type: transactionType,
          nonce,
          nonceCommitment,
          tokenAddress: tokenAddressBigInt,
          amount,
          timestamp,
          blockNumber,
          transactionHash,
          sharesMinted: sharesMinted > BigInt(0) ? sharesMinted : undefined,
        };

        console.log(`[History] Created entry: nonce ${nonce.toString()}, type ${transactionType}, amount ${amount.toString()}`);
        history.push(entry);
        
        // Call the callback if provided (for progressive loading)
        if (onEntryFound) {
          onEntryFound(entry);
        }
      } catch (error) {
        console.error(`[History] Error processing nonce ${nonce.toString()}:`, error);
        // Continue to next nonce
      }
    }

    console.log(`[History] Reconstructed ${history.length} transactions for token ${tokenAddress}`);

    // Sort by nonce in descending order (most recent first)
    history.sort((a, b) => {
      return a.nonce > b.nonce ? -1 : 1;
    });

    return history;
  } catch (error) {
    console.error('Error reconstructing transaction history:', error);
    throw error;
  }
}

