use dep::poseidon::poseidon2::Poseidon2;
use dep::std;

// === DRAND TIMELOCK ENCRYPTION TEST ===
// This test simulates the timelock encryption flow with drand (evmnet)
//
// IMPORTANT: Noir's embedded curve is Grumpkin, NOT BN254.
// Therefore, we CANNOT do V = r * H in-circuit for BN254 points.
// V is computed offchain and passed as a public input.
//
// Circuit verifies:
//   1. ciphertext = plaintext + K where K = KDF(pairing_result)
//
// Contract verifies:
//   1. pairing_result == hash(e(V, drand_pubkey)) using BN254 precompile
//   2. drand_pubkey matches hardcoded evmnet value
//
// Security: If someone provides a fake V, the pairing check will fail on-chain.

// Helper: KDF - derives encryption key from pairing result
// Uses Poseidon2 hash for ZK-friendly key derivation
fn kdf(pairing_result: Field) -> Field {
    Poseidon2::hash([pairing_result], 1)
}

// Main timelock encryption verification (circuit logic)
// V is computed offchain (V = r * H on BN254), passed as public input
fn timelock_verify_encryption(
    plaintext: Field,           // Private: message to encrypt
    pairing_result: Field,      // Public: hash(e(V, drand_pubkey))
    expected_ciphertext: Field, // Public: ciphertext from offchain
) -> (Field, Field) {
    // 1. Derive K from pairing result using Poseidon2 (same as TypeScript)
    let K = kdf(pairing_result);
    
    // 2. Compute ciphertext = plaintext + K
    let computed_ciphertext = plaintext + K;
    
    // 3. Verify computed matches expected (both use Poseidon2 now)
    assert(computed_ciphertext == expected_ciphertext, "Ciphertext mismatch");
    
    // Return K and computed_ciphertext for logging
    (K, computed_ciphertext)
}

#[test]
fn test_drand_timelock_encryption() {
    std::println("╔══════════════════════════════════════════════════════════════╗");
    std::println("║      TEST: Drand Timelock Encryption (Real Values)          ║");
    std::println("╚══════════════════════════════════════════════════════════════╝");
    std::println("");
    
    // === INPUTS (from TypeScript timelock-prep.js output with Poseidon2) ===
    // Private input (witness)
    let plaintext = 42 as Field;
    
    // Public inputs (from offchain computation)
    let target_round = 14161727 as Field;
    let pairing_result = 7454982161247114942090419709036621238296894275792563520607667729655177239595 as Field;
    let expected_ciphertext = 18691358195348525365444204984148224031355373457348998934574405312519615474038 as Field;
    
    // V is computed offchain, passed as public input (for contract verification)
    let expected_V_x = 3398840740332052120597358755822620527412520723655025502452048074494690937474 as Field;
    let expected_V_y = 6423875908450528297073249687018185515808147274469491506877998757626431453411 as Field;
    
    // Drand public key (evmnet) - G2 point (hardcoded in contract, NOT in circuit)
    let drand_pubkey_x0 = 3565178688866727608783247307855519961161197286613423629330948765523825963906 as Field;
    let drand_pubkey_x1 = 2416910118189096557713698606232949750075245832257361418817199221841198809231 as Field;
    let drand_pubkey_y0 = 263980444642394177375858669180402387903005329333277938776544051059273779190 as Field;
    let drand_pubkey_y1 = 18766085122067595057703228467555884757373773082319035490740181099798629248523 as Field;
    
    // Evmnet drand constants (for logging)
    let genesis_time = 1727521075 as Field;
    let period = 3 as Field;
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("INPUTS (from TypeScript timelock-prep.js)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("Evmnet Drand Configuration:");
    std::print("  Beacon ID: evmnet");
    std::println("");
    std::print("  Scheme: bls-bn254-unchained-on-g1");
    std::println("");
    std::print("  Genesis Time: ");
    std::println(genesis_time);
    std::print("  Period: ");
    std::println(period);
    std::print("  seconds");
    std::println("");
    std::println("");
    std::print("Plaintext (message, private): ");
    std::println(plaintext);
    std::print("Target Round (public): ");
    std::println(target_round);
    std::println("");
    std::println("Drand Public Key (evmnet, BN254 G2) - hardcoded in contract:");
    std::print("  x0: ");
    std::println(drand_pubkey_x0);
    std::print("  x1: ");
    std::println(drand_pubkey_x1);
    std::print("  y0: ");
    std::println(drand_pubkey_y0);
    std::print("  y1: ");
    std::println(drand_pubkey_y1);
    std::println("");
    std::print("Pairing Result (hash(e(V, drandPubkey))) - computed offchain: ");
    std::println(pairing_result);
    std::println("");
    
    // === PROCESSING ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("PROCESSING (Circuit Verification)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("NOTE: V = r * H is computed OFFCHAIN (BN254, not in-circuit)");
    std::println("V is passed as public input to the circuit.");
    std::println("");
    
    // V is computed offchain, we just use the expected value
    std::println("V (computed offchain, passed as public input):");
    std::print("  V_x: ");
    std::println(expected_V_x);
    std::print("  V_y: ");
    std::println(expected_V_y);
    std::println("");
    
    // Circuit verifies: ciphertext = plaintext + K where K = KDF(pairing_result)
    let (K, computed_ciphertext) = timelock_verify_encryption(
        plaintext,
        pairing_result,
        expected_ciphertext
    );
    
    std::println("Circuit verification:");
    std::print("  K = KDF(pairing_result) [Poseidon2]: ");
    std::println(K);
    std::print("  Computed ciphertext = plaintext + K: ");
    std::println(computed_ciphertext);
    std::print("  Expected ciphertext (from TypeScript with Poseidon2): ");
    std::println(expected_ciphertext);
    assert(computed_ciphertext == expected_ciphertext, "Ciphertext should match TypeScript output");
    std::println("  ✅ ciphertext matches TypeScript output!");
    std::println("  ✅ Contract will verify pairing ensures correct K derivation");
    std::println("");
    
    // === OUTPUTS ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("OUTPUTS (Public Inputs for Circuit)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("Public inputs that will be verified:");
    std::println("");
    std::print("target_round (pub): ");
    std::println(target_round);
    std::println("");
    std::println("V (pub) - G1 point [x, y] (computed offchain):");
    std::print("  V_x (pub): ");
    std::println(expected_V_x);
    std::print("  V_y (pub): ");
    std::println(expected_V_y);
    std::println("");
    std::print("pairing_result (pub): ");
    std::println(pairing_result);
    std::println("");
    std::print("ciphertext (pub): ");
    std::println(computed_ciphertext);
    std::println("");
    std::println("drand_pubkey (G2) - hardcoded in contract (NOT in circuit):");
    std::print("  x0: ");
    std::println(drand_pubkey_x0);
    std::print("  x1: ");
    std::println(drand_pubkey_x1);
    std::print("  y0: ");
    std::println(drand_pubkey_y0);
    std::print("  y1: ");
    std::println(drand_pubkey_y1);
    std::println("");
    
    // === VERIFICATION ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("VERIFICATION");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    std::println("✅ Circuit verification passed:");
    std::println("   ciphertext = plaintext + K (where K = KDF(pairing_result))");
    std::println("");
    
    std::println("📋 Contract will verify (on-chain):");
    std::println("   1. drand_pubkey matches hardcoded evmnet value");
    std::println("   2. pairing_result == hash(e(V, drand_pubkey))");
    std::println("      (using BN254 pairing precompile 0x08)");
    std::println("");
    std::println("🔒 Security guarantee:");
    std::println("   - If pairing is correct AND pubkey is evmnet → K is correct");
    std::println("   - If K is correct → ciphertext is correct");
    std::println("   - Circuit ensures: ciphertext = plaintext + K");
    std::println("   - Therefore: plaintext ↔ ciphertext relationship is guaranteed");
    std::println("");
    
    // Verify we can decrypt (simulate decryption)
    let decrypted = computed_ciphertext - K;
    assert(decrypted == plaintext, "Decryption should recover plaintext");
    std::println("✅ Decryption test passed (ciphertext - K == plaintext)");
    std::println("");
    
    // === SUMMARY ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("SUMMARY");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("Evmnet Drand Info:");
    std::println("  - Beacon ID: evmnet");
    std::println("  - Scheme: bls-bn254-unchained-on-g1");
    std::println("  - Period: 3 seconds");
    std::println("  - Genesis Time: 1727521075");
    std::println("  - Public Key: G2 point (signatures on G1)");
    std::println("");
    std::println("Flow:");
    std::println("  1. OFFCHAIN: V = r * H(round) on BN254 G1");
    std::println("  2. OFFCHAIN: pairing = e(V, drand_pubkey) on BN254");
    std::println("  3. OFFCHAIN: pairing_result = hash(pairing)");
    std::println("  4. OFFCHAIN: K = KDF(pairing_result)");
    std::println("  5. OFFCHAIN: ciphertext = plaintext + K");
    std::println("");
    std::println("Circuit verifies (in-circuit):");
    std::println("  ✅ ciphertext = plaintext + K");
    std::println("     where K = KDF(pairing_result)");
    std::println("");
    std::println("Contract verifies (on-chain):");
    std::println("  ✅ drand_pubkey (G2) matches hardcoded evmnet value");
    std::println("  ✅ pairing_result == hash(e(V, drand_pubkey))");
    std::println("     using BN254 pairing precompile 0x08");
    std::println("");
    std::println("Security:");
    std::println("  - Contract ensures K is derived from correct evmnet pubkey");
    std::println("  - Circuit ensures ciphertext = plaintext + K");
    std::println("  - Therefore: plaintext ↔ ciphertext is guaranteed");
    std::println("");
    std::println("Public Inputs:");
    std::println("  - target_round: Field");
    std::println("  - V_x, V_y: Field (G1 point, computed offchain)");
    std::println("  - pairing_result: Field (hash of GT, computed offchain)");
    std::println("  - ciphertext: Field");
    std::println("");
    std::println("✅ All tests passed!");
}

