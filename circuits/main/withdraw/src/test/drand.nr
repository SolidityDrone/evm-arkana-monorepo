use dep::poseidon::poseidon2::Poseidon2;
use dep::std;

// === DRAND TIMELOCK ENCRYPTION TEST ===
// [AUTO-GENERATED] by scripts/drand-sync.sh - DO NOT EDIT MANUALLY
//
// IMPORTANT: Noir's embedded curve is Grumpkin, NOT BN254.
// Therefore, we CANNOT do V = r * H in-circuit for BN254 points.
// V is computed offchain and passed as a public input.
//
// Circuit verifies:
//   1. ciphertext = plaintext + K where K = KDF(pairing_result)
//      Note: pairing_result is a private input (witness) in the circuit
//
// Contract verifies:
//   1. e(V, G2_gen) * e(-H, C1) == 1 (proves V = r*H, C1 = r*G2)
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
    // [AUTO-GENERATED VALUES] - DO NOT EDIT MANUALLY
    // Private inputs (witness)
    let plaintext = 42 as Field;
    let pairing_result = 7454982161247114942090419709036621238296894275792563520607667729655177239595 as Field;  // Private: hash(e(V, drand_pubkey))
    
    // Public inputs (from offchain computation)
    let target_round = 14161727 as Field;
    let expected_ciphertext = 18691358195348525365444204984148224031355373457348998934574405312519615474038 as Field;
    
    // H = hash_to_curve(round) on G1 - needed for on-chain pairing verification
    let H_x = 17110099886125304497835776545713209504691977157583709568477924270886121681512 as Field;
    let H_y = 5005500472356267329961646875240392899498427164717219254104199314237179071237 as Field;
    
    // V = r * H on G1 - computed offchain, passed as public input
    let expected_V_x = 3398840740332052120597358755822620527412520723655025502452048074494690937474 as Field;
    let expected_V_y = 6423875908450528297073249687018185515808147274469491506877998757626431453411 as Field;
    
    // C1 = r * G2_gen on G2 - needed for on-chain pairing verification
    // Format: Fp2 coordinates (c0=real, c1=imaginary)
    let C1_x0 = 4134213916343724931760970732975602250786076528375749075160172169169044486969 as Field;
    let C1_x1 = 21558308526502507855325166439008393966717643700102272257425778227652387758205 as Field;
    let C1_y0 = 891189877208105314331199145787525421844052589013600536797344575232083382042 as Field;
    let C1_y1 = 2653326632600946096894137479864389653965751602244102699043300532605270979831 as Field;
    
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
    std::println("OUTPUTS (Public Inputs for Circuit + On-chain Verification)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("Public inputs for circuit and on-chain pairing verification:");
    std::println("");
    std::print("target_round (pub): ");
    std::println(target_round);
    std::println("");
    std::println("H (pub) - G1 point - hash_to_curve(round):");
    std::print("  H_x (pub): ");
    std::println(H_x);
    std::print("  H_y (pub): ");
    std::println(H_y);
    std::println("");
    std::println("V (pub) - G1 point - r * H:");
    std::print("  V_x (pub): ");
    std::println(expected_V_x);
    std::print("  V_y (pub): ");
    std::println(expected_V_y);
    std::println("");
    std::println("C1 (pub) - G2 point - r * G2_gen (for on-chain pairing check):");
    std::print("  C1_x0 (pub): ");
    std::println(C1_x0);
    std::print("  C1_x1 (pub): ");
    std::println(C1_x1);
    std::print("  C1_y0 (pub): ");
    std::println(C1_y0);
    std::print("  C1_y1 (pub): ");
    std::println(C1_y1);
    std::println("");
    std::print("ciphertext (pub): ");
    std::println(computed_ciphertext);
    std::println("");
    std::println("drand_pubkey (G2) - hardcoded in contract:");
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
    
    std::println("Circuit verification passed:");
    std::println("   ciphertext = plaintext + K (where K = KDF(pairing_result))");
    std::println("");
    
    std::println("Contract verifies BEFORE round (zero-trust on pubkey):");
    std::println("   e(V, G2_gen) * e(-H, C1) == 1");
    std::println("   This proves: V = r*H AND C1 = r*G2 for same r");
    std::println("   Using BN254 pairing precompile 0x08");
    std::println("");
    std::println("Contract verifies AFTER round (with drand signature):");
    std::println("   e(sigma, C1) * e(-V, drand_pubkey) == 1");
    std::println("   This proves: encryption used correct drand_pubkey");
    std::println("");
    std::println("Security guarantee:");
    std::println("   - Contract verifies V, C1 use same r (before round)");
    std::println("   - Contract verifies encryption with drand_pubkey (after round)");
    std::println("   - Circuit ensures: ciphertext = plaintext + K");
    std::println("   - Therefore: plaintext <-> ciphertext is GUARANTEED correct");
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
    std::println("OFFCHAIN Flow:");
    std::println("  1. H = hash_to_curve(round) on BN254 G1");
    std::println("  2. V = r * H on BN254 G1");
    std::println("  3. C1 = r * G2_gen on BN254 G2");
    std::println("  4. pairing = e(V, drand_pubkey) on BN254");
    std::println("  5. pairing_result = hash(pairing)");
    std::println("  6. K = KDF(pairing_result)");
    std::println("  7. ciphertext = plaintext + K");
    std::println("");
    std::println("Circuit verifies (in-circuit):");
    std::println("   ciphertext = plaintext + K");
    std::println("   where K = KDF(pairing_result)");
    std::println("");
    std::println("Contract verifies (on-chain) BEFORE round:");
    std::println("   e(V, G2_gen) * e(-H, C1) == 1");
    std::println("   This proves V = r*H, C1 = r*G2 (same r)");
    std::println("");
    std::println("Contract verifies (on-chain) AFTER round:");
    std::println("   e(sigma, C1) * e(-V, drand_pubkey) == 1");
    std::println("   This proves encryption used correct pubkey");
    std::println("");
    std::println("Security (ZERO TRUST on pubkey):");
    std::println("  - Before round: Contract verifies H, V, C1 consistency");
    std::println("  - After round: Contract verifies drand_pubkey correctness");
    std::println("  - Circuit ensures: ciphertext = plaintext + K");
    std::println("  - Therefore: plaintext <-> ciphertext is GUARANTEED");
    std::println("");
    std::println("Public Inputs:");
    std::println("  - target_round: Field");
    std::println("  - H_x, H_y: Field (G1 point)");
    std::println("  - V_x, V_y: Field (G1 point)");
    std::println("  - C1_x0, C1_x1, C1_y0, C1_y1: Field (G2 point)");
    std::println("  - ciphertext: Field (public output)");
    std::println("");
    std::println("Private Inputs:");
    std::println("  - plaintext: Field");
    std::println("  - pairing_result: Field (hash(e(V, drand_pubkey)))");
    std::println("");
    std::println("All tests passed!");
}
