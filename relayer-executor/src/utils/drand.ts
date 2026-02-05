/**
 * dRand utilities for evmnet beacon
 */

const BEACON_ID = 'evmnet';
const GENESIS_TIME = 1727521075;
const PERIOD = 3;

/**
 * Get current dRand round
 */
export function getCurrentRound(): number {
    const now = Math.floor(Date.now() / 1000);
    if (now < GENESIS_TIME) return 0;
    return Math.floor((now - GENESIS_TIME) / PERIOD);
}

/**
 * Get round timestamp
 */
export function getRoundTimestamp(round: number): number {
    return GENESIS_TIME + (round * PERIOD);
}

/**
 * Check if a round is available (has been published)
 */
export function isRoundAvailable(targetRound: number): boolean {
    return targetRound <= getCurrentRound();
}

/**
 * Fetch dRand signature for a specific round
 */
export async function fetchDrandSignature(round: number): Promise<string> {
    const url = `https://api.drand.sh/v2/beacons/${BEACON_ID}/rounds/${round}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch drand round ${round}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.signature;
}

/**
 * Wait until a round becomes available
 */
export async function waitForRound(targetRound: number, checkIntervalMs: number = 1000): Promise<void> {
    while (!isRoundAvailable(targetRound)) {
        const currentRound = getCurrentRound();
        const timeUntilRound = getRoundTimestamp(targetRound) - Math.floor(Date.now() / 1000);
        console.log(`Waiting for round ${targetRound} (current: ${currentRound}, ~${timeUntilRound}s remaining)`);
        await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    }
}

