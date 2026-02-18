/**
 * Groth16 proof formatting for Arkana contract.
 * Uses snarkjs.groth16.exportSolidityCallData so order/format match the on-chain verifier exactly.
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

/** Find the index of the matching ']' for the '[' at start (bracket matching). */
function findMatchingBracket(s: string, start: number): number {
  if (s[start] !== '[') return -1;
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    if (s[i] === '[') depth++;
    else if (s[i] === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Parse the string from snarkjs.groth16.exportSolidityCallData(proof, pub).
 * Format: "[pA],[[pB0],[pB1]],[pC],[pub...]" — use bracket matching; find next '[' after each array (no assumption on separator).
 */
export function parseExportSolidityCallData(callDataString: string): Groth16Args {
  const arrays: string[] = [];
  let i = 0;
  while (arrays.length < 4) {
    const start = callDataString.indexOf('[', i);
    if (start === -1) break;
    const end = findMatchingBracket(callDataString, start);
    if (end === -1) break;
    arrays.push(callDataString.slice(start, end + 1));
    i = end + 1;
  }
  if (arrays.length !== 4) {
    throw new Error(`exportSolidityCallData: expected 4 arrays, got ${arrays.length}`);
  }
  return {
    pA: JSON.parse(arrays[0]) as [string, string],
    pB: JSON.parse(arrays[1]) as [[string, string], [string, string]],
    pC: JSON.parse(arrays[2]) as [string, string],
    publicSignals: JSON.parse(arrays[3]) as string[],
  };
}

/**
 * Convert via exportSolidityCallData so order matches the on-chain verifier exactly.
 */
export async function formatSnarkjsProofForContract(result: SnarkjsProofResult): Promise<Groth16Args> {
  const snarkjs = await import('snarkjs');
  const callDataString = await snarkjs.groth16.exportSolidityCallData(result.proof, result.publicSignals);
  return parseExportSolidityCallData(callDataString);
}

/**
 * Same but with overrides for public signals (e.g. substitute chain_id for entry).
 */
export async function formatSnarkjsProofForContractWithOverrides(
  result: SnarkjsProofResult,
  publicSignalsOverride: string[]
): Promise<Groth16Args> {
  const snarkjs = await import('snarkjs');
  const callDataString = await snarkjs.groth16.exportSolidityCallData(result.proof, publicSignalsOverride);
  return parseExportSolidityCallData(callDataString);
}
