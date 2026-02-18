/**
 * Circom + snarkjs proof generation for Arkana.
 * Loads from public/circuits/{name}/ with same layout as lib/circuits: {name}_js/{name}.wasm and {name}_final.zkey.
 */

import type { Groth16Args, SnarkjsProofResult } from './groth16';
import { formatSnarkjsProofForContract } from './groth16';

export type CircuitName = 'entry' | 'deposit' | 'withdraw' | 'send';

/** Input object for snarkjs: keys must match the circom circuit's input signal names (string values). */
export type CircuitInputs = Record<string, string | string[]>;

const CIRCUIT_BASE = '/circuits';

/** WASM path: same as circom output, public/circuits/entry/entry_js/entry.wasm */
function getWasmUrl(name: CircuitName): string {
  return `${CIRCUIT_BASE}/${name}/${name}_js/${name}.wasm`;
}

function missingArtifactsError(name: CircuitName): string {
  return (
    `Circuit "${name}" artifacts not found. In public/circuits/${name}/ add:\n` +
    `  - ${name}_js/${name}.wasm\n  - ${name}_final.zkey`
  );
}

/** Fail fast with a clear error if WASM is missing or server returned HTML (404 page). */
async function ensureCircuitArtifacts(wasmUrl: string, _zkeyUrl: string, name: CircuitName): Promise<void> {
  const res = await fetch(wasmUrl, { method: 'GET' });
  if (!res.ok) {
    throw new Error(missingArtifactsError(name));
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error(
      `Circuit "${name}": server returned HTML instead of WASM. Add public/circuits/${name}/${name}_js/${name}.wasm and ${name}_final.zkey.`
    );
  }
}

/**
 * Generate a Groth16 proof using snarkjs.
 * Loads public/circuits/{name}/{name}_js/{name}.wasm and public/circuits/{name}/{name}_final.zkey.
 */
export async function proveWithSnarkjs(
  inputs: CircuitInputs,
  name: CircuitName
): Promise<Groth16Args> {
  const base = `${CIRCUIT_BASE}/${name}`;
  const wasmUrl = getWasmUrl(name);
  const zkeyUrl = `${base}/${name}_final.zkey`;

  await ensureCircuitArtifacts(wasmUrl, zkeyUrl, name);

  const snarkjs = await import('snarkjs');
  const result = (await snarkjs.groth16.fullProve(inputs, wasmUrl, zkeyUrl)) as SnarkjsProofResult;
  return formatSnarkjsProofForContract(result);
}
