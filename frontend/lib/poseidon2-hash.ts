/**
 * @deprecated Send message now uses Hash2(Hash3(...), Hash3(...)) via circuit-utils getSendMessageHash.
 * This file is kept for reference only; do not use poseidon2Hash6.
 */

const POSEIDON2_HASH6_WASM_URL = '/circuits/poseidon2_hash6_test_js/poseidon2_hash6_test.wasm';

let _wc: ((input: { in: string[] }) => Promise<bigint[]>) | null = null;

async function getWitnessCalculator(): Promise<((input: { in: string[] }) => Promise<bigint[]>) | null> {
  if (_wc) return _wc;
  if (typeof fetch === 'undefined') return null;
  try {
    const res = await fetch(POSEIDON2_HASH6_WASM_URL);
    if (!res.ok) return null;
    const wasmBuffer = await res.arrayBuffer();
    const builder = (await import('@/lib/poseidon2_hash6_witness_calculator')).default;
    const calculator = await builder(Buffer.from(wasmBuffer));
    _wc = (input: { in: string[] }) => calculator.calculateWitness(input, 0);
    return _wc;
  } catch {
    return null;
  }
}

/**
 * Poseidon2Hash6(a, b, c, d, e, f) matching circom lib/poseidon/poseidon2.circom.
 * Uses WASM from circom build when available; otherwise throws (caller uses fallback).
 */
export async function poseidon2Hash6(
  a: string,
  b: string,
  c: string,
  d: string,
  e: string,
  f: string
): Promise<string> {
  const wc = await getWitnessCalculator();
  if (!wc) throw new Error('Poseidon2Hash6 WASM not available');
  const witness = await wc({ in: [a, b, c, d, e, f] });
  return witness[1].toString();
}
