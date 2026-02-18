'use client';

/**
 * Circom-compatible Poseidon Hash2 and Hash3 for commitment reconstruction.
 * Uses WASM from circom build so (spending_key, nonce_commitment) match the circuit and contract.
 *
 * To enable: build circom test circuits poseidon_hash2_test and poseidon_hash3_test, then copy
 * the generated _js artifacts (e.g. poseidon2_hash2_test_js if circom still names them that way)
 * into frontend/public/circuits/ and the witness_calculator.js into frontend/lib/.
 */

const BN254_SCALAR_FIELD_MODULUS = BigInt(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617'
);

function reduceToField(value: bigint): bigint {
  return value % BN254_SCALAR_FIELD_MODULUS;
}

function toInputString(value: bigint): string {
  return reduceToField(value).toString();
}

type WitnessCalculator = (input: object, sanityCheck: number) => Promise<bigint[]>;

let hash2Calculator: { calculateWitness: WitnessCalculator } | null = null;
let hash3Calculator: { calculateWitness: WitnessCalculator } | null = null;
let hash2Failed = false;
let hash3Failed = false;

async function getHash2Calculator(): Promise<{ calculateWitness: WitnessCalculator } | null> {
  if (hash2Calculator) return hash2Calculator;
  if (hash2Failed) return null;
  if (typeof fetch === 'undefined') return null;
  try {
    const res = await fetch('/circuits/poseidon2_hash2_test_js/poseidon2_hash2_test.wasm');
    if (!res.ok) {
      hash2Failed = true;
      return null;
    }
    const wasmBuffer = await res.arrayBuffer();
    const Buffer = globalThis.Buffer ?? (await import('buffer')).Buffer;
    const builder = (await import('@/lib/poseidon2_hash2_witness_calculator')).default;
    hash2Calculator = await builder(Buffer.from(wasmBuffer));
    return hash2Calculator;
  } catch {
    hash2Failed = true;
    return null;
  }
}

async function getHash3Calculator(): Promise<{ calculateWitness: WitnessCalculator } | null> {
  if (hash3Calculator) return hash3Calculator;
  if (hash3Failed) return null;
  if (typeof fetch === 'undefined') return null;
  try {
    const res = await fetch('/circuits/poseidon2_hash3_test_js/poseidon2_hash3_test.wasm');
    if (!res.ok) {
      hash3Failed = true;
      return null;
    }
    const wasmBuffer = await res.arrayBuffer();
    const Buffer = globalThis.Buffer ?? (await import('buffer')).Buffer;
    const builder = (await import('@/lib/poseidon2_hash3_witness_calculator')).default;
    hash3Calculator = await builder(Buffer.from(wasmBuffer));
    return hash3Calculator;
  } catch {
    hash3Failed = true;
    return null;
  }
}

/**
 * Poseidon Hash2(a, b) using circom WASM. Returns null if circom artifacts are not installed.
 */
export async function poseidon2Hash2Circom(a: bigint, b: bigint): Promise<bigint | null> {
  const calc = await getHash2Calculator();
  if (!calc) return null;
  const witness = await calc.calculateWitness({ in: [toInputString(a), toInputString(b)] }, 0);
  return reduceToField(BigInt(witness[1]));
}

/**
 * Poseidon Hash3(a, b, c) using circom WASM. Returns null if circom artifacts are not installed.
 */
export async function poseidon2Hash3Circom(a: bigint, b: bigint, c: bigint): Promise<bigint | null> {
  const calc = await getHash3Calculator();
  if (!calc) return null;
  const witness = await calc.calculateWitness(
    { in: [toInputString(a), toInputString(b), toInputString(c)] },
    0
  );
  return reduceToField(BigInt(witness[1]));
}
