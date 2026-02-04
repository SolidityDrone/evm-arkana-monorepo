/**
 * Shared utilities for circuit operations across all pages
 */

// VIEW_STRING constant used for computing view keys
export const VIEW_STRING = BigInt('0x76696577696e675f6b6579');

/**
 * Compute private key (user_key) from signature
 * This function is duplicated across multiple pages - extracted here for reuse
 */
export async function computePrivateKeyFromSignature(signatureValue: string): Promise<string> {
  const cryptoModule = await import('@aztec/foundation/crypto');
  const { poseidon2Hash } = cryptoModule;

  // Ensure Buffer is available
  if (!globalThis.Buffer) {
    const { Buffer } = await import('buffer');
    globalThis.Buffer = Buffer;
  }

  // Split signature into 31, 31, 3 bytes (same as in zk-address.ts)
  const sigHex = signatureValue.startsWith('0x') ? signatureValue.slice(2) : signatureValue;
  const sigBuffer = globalThis.Buffer.from(sigHex, 'hex');

  if (sigBuffer.length !== 65) {
    throw new Error(`Signature must be 65 bytes, got ${sigBuffer.length}`);
  }

  const chunk1 = sigBuffer.slice(0, 31);
  const chunk2 = sigBuffer.slice(31, 62);
  const chunk3 = sigBuffer.slice(62, 65);

  const chunk1BigInt = BigInt('0x' + chunk1.toString('hex'));
  const chunk2BigInt = BigInt('0x' + chunk2.toString('hex'));
  const chunk3BigInt = BigInt('0x' + chunk3.toString('hex'));

  // Compute poseidon hash - this is the private key (user_key)
  const poseidonHash = await poseidon2Hash([chunk1BigInt, chunk2BigInt, chunk3BigInt]);

  // Convert to bigint
  let privateKey: bigint;
  if (typeof poseidonHash === 'bigint') {
    privateKey = poseidonHash;
  } else if ('toBigInt' in poseidonHash && typeof (poseidonHash as any).toBigInt === 'function') {
    privateKey = (poseidonHash as any).toBigInt();
  } else if ('value' in poseidonHash) {
    privateKey = BigInt((poseidonHash as any).value);
  } else {
    privateKey = BigInt((poseidonHash as any).toString());
  }

  // Convert to hex string for circuit input
  return '0x' + privateKey.toString(16);
}

/**
 * Compute view key from user key hash
 * view_key = hash([VIEW_STRING, user_key_hash])
 */
export async function getViewKey(userKeyHash: bigint): Promise<bigint> {
  const { poseidon2Hash } = await import('@aztec/foundation/crypto');
  const viewKey = await poseidon2Hash([VIEW_STRING, userKeyHash]);
  
  // Convert to bigint
  if (typeof viewKey === 'bigint') {
    return viewKey;
  } else if ('toBigInt' in viewKey && typeof (viewKey as any).toBigInt === 'function') {
    return (viewKey as any).toBigInt();
  } else if ('value' in viewKey) {
    return BigInt((viewKey as any).value);
  } else {
    return BigInt((viewKey as any).toString());
  }
}

/**
 * Compute view key from user key (not hashed)
 * view_key = hash([VIEW_STRING, user_key])
 */
export async function getViewKeyFromUserKey(userKey: bigint): Promise<bigint> {
  const { poseidon2Hash } = await import('@aztec/foundation/crypto');
  const viewKey = await poseidon2Hash([VIEW_STRING, userKey]);
  
  // Convert to bigint
  if (typeof viewKey === 'bigint') {
    return viewKey;
  } else if ('toBigInt' in viewKey && typeof (viewKey as any).toBigInt === 'function') {
    return (viewKey as any).toBigInt();
  } else if ('value' in viewKey) {
    return BigInt((viewKey as any).value);
  } else {
    return BigInt((viewKey as any).toString());
  }
}

