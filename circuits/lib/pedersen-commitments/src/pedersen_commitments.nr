use dep::std;
use dep::std::embedded_curve_ops::{EmbeddedCurvePoint, EmbeddedCurveScalar, multi_scalar_mul};

/// Pedersen commitment with 2 generators: m*G + r*H
/// This is the standard 2-generator Pedersen commitment
pub fn pedersen_commitment(m: Field, r: Field) -> EmbeddedCurvePoint {
    let generators: [EmbeddedCurvePoint; 2] =
        std::hash::derive_generators("PEDERSEN_COMMITMENT".as_bytes(), 0);
    
    let G = generators[0];  // First generator for m
    let H = generators[1];  // Second generator for r
    
     // Create scalars for multi_scalar_mul
    let mut scalars = [EmbeddedCurveScalar { lo: 0, hi: 0 }; 2];
    scalars[0] = from_field(m);
    scalars[1] = from_field(r);
    
    // Create points for multi_scalar_mul: [G, H]
    let mut points = [EmbeddedCurvePoint::point_at_infinity(); 2];
    points[0] = G;
    points[1] = H;
    
    // Compute commitment: m*G + r*H
    multi_scalar_mul(points, scalars)
}

/// Pedersen commitment with 4 generators: m1*G + m2*H + m3*D + r*J
/// Used for share-based balance commitments where:
/// - m1 = shares (balance in shares)
/// - m2 = nullifier
/// - m3 = spending_key
/// - r = nonce_commitment (blinding factor)
pub fn pedersen_commitment_4(m1: Field, m2: Field, m3: Field, r: Field) -> EmbeddedCurvePoint {
    let generators: [EmbeddedCurvePoint; 4] =
        std::hash::derive_generators("PEDERSEN_COMMITMENT_4".as_bytes(), 0);
    
    let G = generators[0];  // Generator for shares (m1)
    let H = generators[1];  // Generator for nullifier (m2)
    let D = generators[2];  // Generator for spending_key (m3)
    let J = generators[3];  // Generator for nonce_commitment (r)
    
    // Create scalars for multi_scalar_mul
    let mut scalars = [EmbeddedCurveScalar { lo: 0, hi: 0 }; 4];
    scalars[0] = from_field(m1);
    scalars[1] = from_field(m2);
    scalars[2] = from_field(m3);
    scalars[3] = from_field(r);
    
    // Create points for multi_scalar_mul: [G, H, D, J]
    let mut points = [EmbeddedCurvePoint::point_at_infinity(); 4];
    points[0] = G;
    points[1] = H;
    points[2] = D;
    points[3] = J;
    
    // Compute commitment: m1*G + m2*H + m3*D + r*J
    multi_scalar_mul(points, scalars)
}

/// Pedersen commitment with 5 generators: m1*G + m2*H + m3*D + m4*K + r*J
/// Used for share-based balance commitments where:
/// - m1 = shares (balance in shares)
/// - m2 = nullifier
/// - m3 = spending_key
/// - m4 = unlocks_at (timestamp when funds can be unlocked)
/// - r = nonce_commitment (blinding factor)
pub fn pedersen_commitment_5(m1: Field, m2: Field, m3: Field, m4: Field, r: Field) -> EmbeddedCurvePoint {
    let generators: [EmbeddedCurvePoint; 5] =
        std::hash::derive_generators("PEDERSEN_COMMITMENT_5".as_bytes(), 0);
    
    let G = generators[0];  // Generator for shares (m1)
    let H = generators[1];  // Generator for nullifier (m2)
    let D = generators[2];  // Generator for spending_key (m3)
    let K = generators[3];  // Generator for unlocks_at (m4)
    let J = generators[4];  // Generator for nonce_commitment (r)
    
    // Create scalars for multi_scalar_mul
    let mut scalars = [EmbeddedCurveScalar { lo: 0, hi: 0 }; 5];
    scalars[0] = from_field(m1);
    scalars[1] = from_field(m2);
    scalars[2] = from_field(m3);
    scalars[3] = from_field(m4);
    scalars[4] = from_field(r);
    
    // Create points for multi_scalar_mul: [G, H, D, K, J]
    let mut points = [EmbeddedCurvePoint::point_at_infinity(); 5];
    points[0] = G;
    points[1] = H;
    points[2] = D;
    points[3] = K;
    points[4] = J;
    
    // Compute commitment: m1*G + m2*H + m3*D + m4*K + r*J
    multi_scalar_mul(points, scalars)
}

// === COMMITMENT VERIFICATION ===

pub fn verify_commitment_opening(commitment: EmbeddedCurvePoint, m: Field, r: Field) -> bool {
    let computed_commitment = pedersen_commitment(m, r);
    let x_equal = computed_commitment.x == commitment.x;
    let y_equal = computed_commitment.y == commitment.y;
    x_equal & y_equal
}

// === COMMITMENT ARITHMETIC ===

pub fn add_commitments(c1: EmbeddedCurvePoint, c2: EmbeddedCurvePoint) -> EmbeddedCurvePoint {
    c1 + c2
}

pub fn add_multiple_commitments(commitments: [EmbeddedCurvePoint]) -> EmbeddedCurvePoint {
    let mut result = EmbeddedCurvePoint::point_at_infinity();
    
    for i in 0..commitments.len() {
        if i == 0 {
            result = commitments[i];
        } else {
            result = result + commitments[i];
        }
    }
    
    result
}

pub fn subtract_commitments(c1: EmbeddedCurvePoint, c2: EmbeddedCurvePoint) -> EmbeddedCurvePoint {
    // c1 - c2 = c1 + (-c2)
    let neg_c2 = -c2;
    c1 + neg_c2
}



// === UTILITY FUNCTIONS ===


global TWO_POW_128: Field = 0x100000000000000000000000000000000;

fn compute_decomposition(x: Field) -> (Field, Field) {
    // Here's we're taking advantage of truncating 128 bit limbs from the input field
    // and then subtracting them from the input such the field division is equivalent to integer division.
    let low = (x as u128) as Field;
    let high = (x - low) / TWO_POW_128;

    (low, high)
}

fn from_field(scalar: Field) -> EmbeddedCurveScalar {
    // Safety: xlo and xhi decomposition is checked below
    let (xlo, xhi) = compute_decomposition(scalar);
    // Check that the decomposition is correct
    assert_eq(scalar, xlo + TWO_POW_128 * xhi);
    EmbeddedCurveScalar { lo: xlo, hi: xhi }
}

// === TESTS ===

#[test]
fn test_print_5_generators() {
    // Derive the 5 generators used in pedersen_commitment_5
    let generators: [EmbeddedCurvePoint; 5] =
        std::hash::derive_generators("PEDERSEN_COMMITMENT_5".as_bytes(), 0);
    
    let G = generators[0];  // Generator for shares (m1)
    let H = generators[1];  // Generator for nullifier (m2)
    let D = generators[2];  // Generator for spending_key (m3)
    let K = generators[3];  // Generator for unlocks_at (m4)
    let J = generators[4];  // Generator for nonce_commitment (r)
    
    // Print all 5 generators
    std::println("=== PEDERSEN_COMMITMENT_5 GENERATORS ===");
    
    std::println("Generator G (shares):");
    std::println("  x: ");
    std::print(G.x);
    std::println("  y: ");
    std::print(G.y);
    
    std::println("Generator H (nullifier):");
    std::println("  x: ");
    std::print(H.x);
    std::println("  y: ");
    std::print(H.y);
    
    std::println("Generator D (spending_key):");
    std::println("  x: ");
    std::print(D.x);
    std::println("  y: ");
    std::print(D.y);
    
    std::println("Generator K (unlocks_at):");
    std::println("  x: ");
    std::print(K.x);
    std::println("  y: ");
    std::print(K.y);
    
    std::println("Generator J (nonce_commitment):");
    std::println("  x: ");
    std::print(J.x);
    std::println("  y: ");
    std::print(J.y);
    
    std::println("========================================");
    
    // Basic assertions to ensure generators are valid (not point at infinity)
    // Check that at least one coordinate is non-zero
    let g_not_infinity = (G.x != 0) | (G.y != 0);
    let h_not_infinity = (H.x != 0) | (H.y != 0);
    let d_not_infinity = (D.x != 0) | (D.y != 0);
    let k_not_infinity = (K.x != 0) | (K.y != 0);
    let j_not_infinity = (J.x != 0) | (J.y != 0);
    
    assert(g_not_infinity, "Generator G should not be point at infinity");
    assert(h_not_infinity, "Generator H should not be point at infinity");
    assert(d_not_infinity, "Generator D should not be point at infinity");
    assert(k_not_infinity, "Generator K should not be point at infinity");
    assert(j_not_infinity, "Generator J should not be point at infinity");
    
    // Ensure generators are distinct (at least one coordinate differs)
    let g_h_distinct = (G.x != H.x) | (G.y != H.y);
    let g_d_distinct = (G.x != D.x) | (G.y != D.y);
    let g_k_distinct = (G.x != K.x) | (G.y != K.y);
    let g_j_distinct = (G.x != J.x) | (G.y != J.y);
    
    assert(g_h_distinct, "Generators G and H should be distinct");
    assert(g_d_distinct, "Generators G and D should be distinct");
    assert(g_k_distinct, "Generators G and K should be distinct");
    assert(g_j_distinct, "Generators G and J should be distinct");
}
