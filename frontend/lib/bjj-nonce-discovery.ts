/**
 * Baby Jubjub (BJJ) nonce discovery helpers
 * Matches Arkana.sol (BJJ.add) and circom PedersenCommitment2FixedM1 (G + r*H on BJJ).
 * Contract uses BJJ for tokenNonceDiscoveryPoint aggregation; circom outputs BJJ points.
 */

import { babyjubjub } from '@noble/curves/misc.js';

/** BJJ point (x, y) on Baby Jubjub curve */
export interface BJJPoint {
  x: bigint;
  y: bigint;
}

/** Identity element on Baby Jubjub: (0, 1) - matches contract BJJ.sol. */
export const BJJ_IDENTITY: BJJPoint = { x: BigInt(0), y: BigInt(1) };

/** Default nonce discovery point when token has no entries. Must match Arkana.sol DEFAULT_NONCE_DISCOVERY_X/Y (and M=1, R=1). */
export const DEFAULT_NONCE_DISCOVERY_POINT: BJJPoint = {
  x: BigInt('4392536750732362865918638758609041408585186611207775368361094155784201629032'),
  y: BigInt('21825405433778094041183639453576582602612179060985696850137150857802961151461'),
};

/** Generators from circom PedersenCommitment2FixedM1 (nonce discovery entry = G + r*H) */
const NONCE_DISCOVERY_G: BJJPoint = {
  x: BigInt('10457101036533406547632367118273992217979173478358440826365724437999023779287'),
  y: BigInt('19824078218392094440610104313265183977899662750282163392862422243483260492317'),
};
const NONCE_DISCOVERY_H: BJJPoint = {
  x: BigInt('2671756056509184035029146175565761955751135805354291559563293617232983272177'),
  y: BigInt('2663205510731142763556352975002641716101654201788071096152948830924149045094'),
};

/**
 * Add two BJJ points. Matches contract BJJ.add for nonce discovery aggregation.
 */
export function bjjAdd(p1: BJJPoint, p2: BJJPoint): BJJPoint {
  const P1 = babyjubjub.Point.fromAffine({ x: p1.x, y: p1.y });
  const P2 = babyjubjub.Point.fromAffine({ x: p2.x, y: p2.y });
  const sum = P1.add(P2);
  return { x: sum.x, y: sum.y };
}

/**
 * Compute nonce discovery entry = G + r*H on Baby Jubjub.
 * Matches circom PedersenCommitment2FixedM1 and contract _addNonceDiscoveryEntry input.
 */
export function nonceDiscoveryEntryBJJ(nonceCommitment: bigint): BJJPoint {
  const G = babyjubjub.Point.fromAffine({ x: NONCE_DISCOVERY_G.x, y: NONCE_DISCOVERY_G.y });
  const H = babyjubjub.Point.fromAffine({ x: NONCE_DISCOVERY_H.x, y: NONCE_DISCOVERY_H.y });
  const rH = H.multiply(nonceCommitment);
  const point = G.add(rH);
  return { x: point.x, y: point.y };
}
