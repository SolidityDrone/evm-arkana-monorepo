use dep::std;
use dep::std::embedded_curve_ops::EmbeddedCurvePoint;

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

