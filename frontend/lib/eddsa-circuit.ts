/**
 * EdDSA signer identity and message signing for circuits (withdraw, send, absorb_send, absorb_withdraw).
 * Single-user path: derive from user_key. Uses circomlibjs to match circuit's EdDSAPoseidonVerifier.
 *
 * Withdraw message = Hash2(Hash3(ta,ch,amount), Hash2(fee, nonce)).
 * Send message = Hash2(Hash3(ta,ch,amount), Hash3(fee, receiver_pubkey_hash, nonce)).
 * Circuits use current_nonce = previous_nonce + 1. Callers must pass current_nonce when signing.
 */

/** Convert user_key (bigint or hex) to 32-byte hex string for circomlib EdDSA. */
export function userKeyToPrivKey32(userKey: bigint | string): string {
  const n = typeof userKey === 'string' ? BigInt(userKey.startsWith('0x') ? userKey : '0x' + userKey) : userKey;
  const hex = n.toString(16);
  const padded = hex.padStart(64, '0').slice(-64);
  return padded;
}

let _eddsa: any = null;
let _poseidon: any = null;
let _F: any = null;

async function getCircomLib() {
  if (typeof window === 'undefined') {
    throw new Error('EdDSA/circomlibjs is only available in the browser. Do not call getSignerIdentityFromUserKey or signWithdrawMessage during SSR.');
  }
  if (_eddsa && _poseidon && _F) return { eddsa: _eddsa, poseidon: _poseidon, F: _F };
  const circomlibjs = await import('circomlibjs');
  const babyJub = await circomlibjs.buildBabyjub();
  _eddsa = await circomlibjs.buildEddsa();
  _poseidon = await circomlibjs.buildPoseidon();
  _F = babyJub.F;
  return { eddsa: _eddsa, poseidon: _poseidon, F: _F };
}

export type SignerIdentity = {
  signer_pubkey_hash: string;
  signer_public_key: [string, string];
};

/**
 * Get signer identity from user_key for circuit inputs (single user, no FROST).
 * signer_pubkey_hash = Hash2(Ax, Ay) to match circuit.
 */
export async function getSignerIdentityFromUserKey(userKey: bigint | string): Promise<SignerIdentity> {
  const { eddsa, F } = await getCircomLib();
  const { poseidonHash } = await import('@/lib/circuit-utils');
  const privKeyHex = userKeyToPrivKey32(userKey);
  const privKey = Buffer.from(privKeyHex, 'hex');
  const pubKey = eddsa.prv2pub(privKey);
  const Ax = F.toObject(pubKey[0]).toString();
  const Ay = F.toObject(pubKey[1]).toString();
  const signer_pubkey_hash = (await poseidonHash([BigInt(Ax), BigInt(Ay)])).toString();
  return {
    signer_pubkey_hash,
    signer_public_key: [Ax, Ay],
  };
}

/**
 * Sign the withdraw message. Message = Poseidon2(left, right) where left=Hash4(ta,ch,amt,fee), right=Hash3(nonce,arb_hash,receiver).
 */
export async function signWithdrawMessage(
  userKey: bigint | string,
  token_address: string,
  chain_id: string,
  amount: string,
  relayer_fee_amount: string,
  current_nonce: string,
  arbitrary_calldata_hash: string,
  receiver_address: string
): Promise<{ signature: [string, string, string]; message: string }> {
  const { eddsa, F } = await getCircomLib();
  const { getWithdrawMessageHash } = await import('@/lib/circuit-utils');
  const messageBigInt = await getWithdrawMessageHash(
    BigInt(token_address),
    BigInt(chain_id),
    BigInt(amount),
    BigInt(relayer_fee_amount),
    BigInt(current_nonce),
    BigInt(arbitrary_calldata_hash),
    BigInt(receiver_address)
  );
  const message = messageBigInt.toString();
  const msgField = F.e(messageBigInt);
  const privKey = Buffer.from(userKeyToPrivKey32(userKey), 'hex');
  const sig = eddsa.signPoseidon(privKey, msgField);
  return {
    signature: [
      F.toObject(sig.R8[0]).toString(),
      F.toObject(sig.R8[1]).toString(),
      sig.S.toString(),
    ],
    message,
  };
}

/**
 * Sign the send message. Message = Hash2(Hash3(ta,ch,amount), Hash3(fee, receiver_pubkey_hash, nonce)).
 */
export async function signSendMessage(
  userKey: bigint | string,
  token_address: string,
  chain_id: string,
  amount: string,
  relayer_fee_amount: string,
  receiver_public_key_x: string,
  receiver_public_key_y: string,
  current_nonce: string
): Promise<{ signature: [string, string, string]; message: string }> {
  const { eddsa, F } = await getCircomLib();
  const { poseidonHash, getSendMessageHash } = await import('@/lib/circuit-utils');
  const receiver_pubkey_hash = await poseidonHash([
    BigInt(receiver_public_key_x),
    BigInt(receiver_public_key_y),
  ]);
  const messageBigInt = await getSendMessageHash(
    BigInt(token_address),
    BigInt(chain_id),
    BigInt(amount),
    BigInt(relayer_fee_amount),
    receiver_pubkey_hash,
    BigInt(current_nonce)
  );
  const message = messageBigInt.toString();
  const msgField = F.e(messageBigInt);
  const privKey = Buffer.from(userKeyToPrivKey32(userKey), 'hex');
  const sig = eddsa.signPoseidon(privKey, msgField);
  return {
    signature: [
      F.toObject(sig.R8[0]).toString(),
      F.toObject(sig.R8[1]).toString(),
      sig.S.toString(),
    ],
    message,
  };
}
