/**
 * Groth16 proof formatting for Arkana contract.
 * Converts snarkjs fullProve output to (pA, pB, pC, publicSignals) expected by the verifier.
 */

export type Groth16Args = {
  pA: [string, string];
  pB: [[string, string], [string, string]];
  pC: [string, string];
  publicSignals: string[];
};

/** snarkjs fullProve return type (minimal shape we need) */
export type SnarkjsProofResult = {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: string[];
};

/** Pad/format a value as 32-byte hex for contract (uint256) */
function toBytes32Hex(v: string | number | bigint): string {
  const n = typeof v === 'bigint' ? v : BigInt(v);
  const hex = n.toString(16);
  return '0x' + hex.padStart(64, '0');
}

/**
 * Convert snarkjs.groth16.fullProve() result to contract call args.
 * Contract expects pA[2], pB[2][2], pC[2], publicSignals[] as uint256 (bytes32).
 */
export function formatSnarkjsProofForContract(result: SnarkjsProofResult): Groth16Args {
  const { proof, publicSignals } = result;
  return {
    pA: [toBytes32Hex(proof.pi_a[0]), toBytes32Hex(proof.pi_a[1])],
    pB: [
      [toBytes32Hex(proof.pi_b[0][1]), toBytes32Hex(proof.pi_b[0][0])],
      [toBytes32Hex(proof.pi_b[1][1]), toBytes32Hex(proof.pi_b[1][0])],
    ],
    pC: [toBytes32Hex(proof.pi_c[0]), toBytes32Hex(proof.pi_c[1])],
    publicSignals: publicSignals.map((s) => toBytes32Hex(s)),
  };
}
