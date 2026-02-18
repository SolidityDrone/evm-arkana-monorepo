/**
 * Compute private key (user_key) from signature
 */
export async function computePrivateKeyFromSignature(signatureValue: string): Promise<string> {
  if (!globalThis.Buffer) {
    const { Buffer } = await import('buffer');
    globalThis.Buffer = Buffer;
  }
  const [c1, c2, c3] = signatureChunksToBigInts(signatureValue);
  const hash = await poseidonHash([c1, c2, c3]);
  return '0x' + hash.toString(16);
}

function signatureChunksToBigInts(signatureValue: string): [bigint, bigint, bigint] {
  if (!globalThis.Buffer) {
    throw new Error('Buffer polyfill required');
  }
  const sigHex = signatureValue.startsWith('0x') ? signatureValue.slice(2) : signatureValue;
  const sigBuffer = globalThis.Buffer.from(sigHex, 'hex');
  if (sigBuffer.length !== 65) {
    throw new Error(`Signature must be 65 bytes, got ${sigBuffer.length}`);
  }
  const chunk1 = BigInt('0x' + sigBuffer.slice(0, 31).toString('hex'));
  const chunk2 = BigInt('0x' + sigBuffer.slice(31, 62).toString('hex'));
  const chunk3 = BigInt('0x' + sigBuffer.slice(62, 65).toString('hex'));
  return [chunk1, chunk2, chunk3];
}

/**
 * Shared utilities for circuit operations across all pages
 */

// VIEW_STRING constant used for computing view keys
export const VIEW_STRING = BigInt('0x76696577696e675f6b6579');

// BN254 scalar field modulus
const BN254_SCALAR_FIELD_MODULUS = BigInt(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617'
);

/** Reduce to BN254 field. */
export function reduceToBn254Field(value: bigint): bigint {
  return value % BN254_SCALAR_FIELD_MODULUS;
}

let _poseidon: { (inputs: bigint[]): bigint } | null = null;

async function getPoseidon(): Promise<(inputs: bigint[]) => bigint> {
  if (_poseidon) return _poseidon;
  const circomlibjs = await import('circomlibjs');
  const p = await circomlibjs.buildPoseidon();
  _poseidon = (inputs: bigint[]) => {
    const out = p(inputs);
    const str = p.F.toString(out);
    return BigInt(str);
  };
  return _poseidon;
}

/**
 * Poseidon hash (circomlib / BN254). Matches contract PoseidonT3 for 2 inputs.
 * Inputs are reduced mod BN254 scalar field.
 */
export async function poseidonHash(inputs: bigint[]): Promise<bigint> {
  const reduced = inputs.map(reduceToBn254Field);
  const poseidon = await getPoseidon();
  const out = poseidon(reduced);
  return reduceToBn254Field(BigInt(out.toString()));
}

/**
 * Compute view key from user key hash
 * view_key = hash([VIEW_STRING, user_key_hash])
 */
export async function getViewKey(userKeyHash: bigint): Promise<bigint> {
  return poseidonHash([VIEW_STRING, userKeyHash]);
}

/**
 * Compute view key from user key (not hashed)
 * view_key = hash([VIEW_STRING, user_key])
 */
export async function getViewKeyFromUserKey(userKey: bigint): Promise<bigint> {
  return poseidonHash([VIEW_STRING, userKey]);
}

/**
 * Spending key = Hash3(Hash2(user_key, chain_id), token_address, signer_pubkey_hash).
 */
export async function getSpendingKey(
  userKey: bigint,
  chainId: bigint,
  tokenAddress: bigint,
  signerPubkeyHash: bigint | string
): Promise<bigint> {
  const h = typeof signerPubkeyHash === 'string' ? BigInt(signerPubkeyHash) : signerPubkeyHash;
  const h2 = await poseidonHash([userKey, chainId]);
  return poseidonHash([h2, tokenAddress, h]);
}

/**
 * Circuit spending key = Hash3(user_key, chain_id, token_address).
 * Matches circom Poseidon2Hash3(user_key, chain_id, token_address) used in entry/deposit.
 */
export async function getSpendingKeyCircuit(
  userKey: bigint,
  chainId: bigint,
  tokenAddress: bigint
): Promise<bigint> {
  return poseidonHash([userKey, chainId, tokenAddress]);
}

/**
 * Send message = Hash2(Hash3(token_address, chain_id, amount), Hash3(relayer_fee_amount, receiver_pubkey_hash, current_nonce)).
 */
export async function getSendMessageHash(
  tokenAddress: bigint,
  chainId: bigint,
  amount: bigint,
  relayerFeeAmount: bigint,
  receiverPubkeyHash: bigint,
  currentNonce: bigint
): Promise<bigint> {
  const left = await poseidonHash([tokenAddress, chainId, amount]);
  const right = await poseidonHash([relayerFeeAmount, receiverPubkeyHash, currentNonce]);
  return poseidonHash([left, right]);
}

/**
 * Withdraw message = Hash2(Hash3(token_address, chain_id, amount), Hash2(relayer_fee_amount, current_nonce)).
 */
export async function getWithdrawMessageHash(
  tokenAddress: bigint,
  chainId: bigint,
  amount: bigint,
  relayerFeeAmount: bigint,
  currentNonce: bigint
): Promise<bigint> {
  const left = await poseidonHash([tokenAddress, chainId, amount]);
  const right = await poseidonHash([relayerFeeAmount, currentNonce]);
  return poseidonHash([left, right]);
}
