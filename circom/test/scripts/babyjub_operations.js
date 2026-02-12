/**
 * Baby Jubjub Operations Helper
 * Baby Jubjub is an Edwards curve embedded in Fr (BN254 scalar field)
 * Curve equation: ax² + y² = 1 + dx²y² where a = 168700, d = 168696
 * 
 * Since Baby Jubjub is embedded in Fr, Circom can do native arithmetic on it.
 */

// Baby Jubjub curve parameters
const A = 168700n;
const D = 168696n;
const P = 21888242871839275222246405745257275088548364400416034343698204186575808495617n; // Fr (scalar field)

/**
 * Modular arithmetic in Fr
 */
function modFr(a) {
    return ((a % P) + P) % P;
}

/**
 * Modular inverse in Fr using extended Euclidean algorithm
 */
function modInverseFr(a) {
    const a_mod = modFr(a);
    if (a_mod === 0n) {
        throw new Error('Cannot compute inverse of 0');
    }
    
    let [old_r, r] = [a_mod, P];
    let [old_s, s] = [1n, 0n];
    
    while (r !== 0n) {
        const q = old_r / r;
        [old_r, r] = [r, old_r - q * r];
        [old_s, s] = [s, old_s - q * s];
    }
    
    return modFr(old_s);
}

/**
 * Point addition on Baby Jubjub
 * Curve: ax² + y² = 1 + dx²y²
 * Formula from circomlib/babyjub.circom
 */
function babyJubAdd(p1, p2) {
    const x1 = BigInt(p1.x);
    const y1 = BigInt(p1.y);
    const x2 = BigInt(p2.x);
    const y2 = BigInt(p2.y);
    
    // Handle point at infinity (0, 1) - but Baby Jubjub doesn't use (0,0) as infinity
    // Actually, Baby Jubjub uses (0, 1) as the identity point
    
    // Formula from BabyAdd template:
    // beta = x1*y2
    // gamma = y1*x2
    // delta = (-a*x1 + y1) * (x2 + y2)
    // tau = beta * gamma
    // xout = (beta + gamma) / (1 + d*tau)
    // yout = (delta + a*beta - gamma) / (1 - d*tau)
    
    const beta = modFr(x1 * y2);
    const gamma = modFr(y1 * x2);
    const delta = modFr((modFr(-A * x1) + y1) * modFr(x2 + y2));
    const tau = modFr(beta * gamma);
    
    const denom_x = modFr(1n + D * tau);
    const denom_y = modFr(1n - D * tau);
    
    if (denom_x === 0n || denom_y === 0n) {
        // Point at infinity case
        return { x: 0n, y: 1n };
    }
    
    const xout = modFr((beta + gamma) * modInverseFr(denom_x));
    const yout = modFr((delta + A * beta - gamma + P) * modInverseFr(denom_y));
    
    return { x: xout, y: yout };
}

/**
 * Point doubling on Baby Jubjub
 * Uses addition with same point
 */
function babyJubDouble(point) {
    return babyJubAdd(point, point);
}

/**
 * Scalar multiplication on Baby Jubjub
 * Uses double-and-add algorithm
 */
function babyJubScalarMul(scalar, point) {
    const k = BigInt(scalar);
    if (k === 0n) {
        return { x: 0n, y: 1n }; // Point at infinity (identity)
    }
    
    let result = { x: 0n, y: 1n }; // Point at infinity (identity)
    let addend = { x: BigInt(point.x), y: BigInt(point.y) };
    
    // Process bits from MSB to LSB
    for (let i = 253; i >= 0; i--) {
        result = babyJubDouble(result);
        if ((k >> BigInt(i)) & 1n) {
            result = babyJubAdd(result, addend);
        }
    }
    
    return result;
}

/**
 * Compute scalar * point on Baby Jubjub
 */
async function scalarMul(scalar, point) {
    const result = babyJubScalarMul(scalar.toString(), {
        x: point[0].toString(),
        y: point[1].toString()
    });
    
    return {
        x: result.x.toString(),
        y: result.y.toString()
    };
}

/**
 * Add two points on Baby Jubjub
 */
async function pointAdd(p1, p2) {
    const result = babyJubAdd(
        { x: p1[0].toString(), y: p1[1].toString() },
        { x: p2[0].toString(), y: p2[1].toString() }
    );
    
    return {
        x: result.x.toString(),
        y: result.y.toString()
    };
}

// Generator constants for PedersenCommitment5 (Baby Jubjub)
// Using circomlib's Pedersen generators
const GENERATOR_G_X = "10457101036533406547632367118273992217979173478358440826365724437999023779287";
const GENERATOR_G_Y = "19824078218392094440610104313265183977899662750282163392862422243483260492317";

/**
 * Simulate contract's share addition: final_point = circuit_point + shares*G
 * Then compute leaf = Poseidon2Hash2(final_point)
 * 
 * Note: shares is always > 0 for deposits, so we can use direct multiplication
 */
async function simulateContractShareAddition(circuitCommitmentPoint, shares, poseidon2Hash2) {
    // Use the exported generator G for PedersenCommitment5 (Baby Jubjub)
    const generatorG = [GENERATOR_G_X, GENERATOR_G_Y];
    
    // Step 1: Compute shares*G directly (shares > 0 for deposits)
    const sharesG = await scalarMul(shares.toString(), generatorG);
    
    // Step 2: Add shares*G to circuit commitment point
    const finalPoint = await pointAdd(
        [circuitCommitmentPoint.x, circuitCommitmentPoint.y],
        [sharesG.x, sharesG.y]
    );
    
    // Step 3: Hash to get leaf (as contract does)
    const leaf = await poseidon2Hash2(finalPoint.x, finalPoint.y);
    
    return {
        sharesG,
        finalPoint,
        leaf
    };
}

module.exports = {
    GENERATOR_G_X,
    GENERATOR_G_Y,
    scalarMul,
    pointAdd,
    simulateContractShareAddition,
    babyJubAdd,
    babyJubDouble,
    babyJubScalarMul
};

