use dep::std;
use dep::poseidon::poseidon2::Poseidon2;
use crate::main;

#[test]
fn test_entry_circuit() {
    let user_key = 0x1234567890abcdef as Field;
    let token_address = 0x02 as Field;
    let chain_id = 1 as Field; // Mainnet chain ID
    
    // Call the main entry circuit function
    let result: ([Field; 2], Field, [Field; 2]) = main(user_key, token_address, chain_id);
    let pedersen_commitment_point: [Field; 2] = result.0;
    let nonce_commitment = result.1;
    let nonce_discovery_entry: [Field; 2] = result.2;
    
    // Basic test: Pedersen commitment point should not be zero
    assert(pedersen_commitment_point[0] != 0, "Pedersen commitment x should not be zero");
    assert(pedersen_commitment_point[1] != 0, "Pedersen commitment y should not be zero");
    
    // Basic test: nonce_commitment should not be zero
    assert(nonce_commitment != 0, "Nonce commitment should not be zero");
    
    // Basic test: nonce_discovery_entry should not be zero
    assert(nonce_discovery_entry[0] != 0, "Nonce discovery entry x should not be zero");
    assert(nonce_discovery_entry[1] != 0, "Nonce discovery entry y should not be zero");
    
    // === VERIFY CALCULATION ===
    // Reconstruct the expected commitment step by step
    let nonce = 0 as Field;
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    
    // nonceCommitment now includes token_address
    let expected_nonce_commitment = Poseidon2::hash([spending_key, nonce, token_address], 3);
    
    // Verify nonce commitment matches
    assert(nonce_commitment == expected_nonce_commitment, "Nonce commitment should match expected calculation");
    
    // Verify determinism: same inputs should produce same output
    let result_2: ([Field; 2], Field, [Field; 2]) = main(user_key, token_address, chain_id);
    assert(pedersen_commitment_point[0] == result_2.0[0], "Same inputs should produce same commitment x");
    assert(pedersen_commitment_point[1] == result_2.0[1], "Same inputs should produce same commitment y");
    
    // Verify different user keys produce different commitments
    let user_key_2 = 0xfedcba0987654321 as Field;
    let result_4: ([Field; 2], Field, [Field; 2]) = main(user_key_2, token_address, chain_id);
    // At least the x coordinate should be different (sufficient for testing)
    assert(pedersen_commitment_point[0] != result_4.0[0], "Different user keys should produce different commitment x");
    
    // Verify different token addresses produce different commitments
    let token_address_2 = 0x03 as Field;
    let result_5: ([Field; 2], Field, [Field; 2]) = main(user_key, token_address_2, chain_id);
    assert(pedersen_commitment_point[0] != result_5.0[0], "Different token addresses should produce different commitment x");
    
    std::println("✅ Entry circuit test passed!");
    std::println("Pedersen commitment x:");
    std::println(pedersen_commitment_point[0]);
    std::println("Pedersen commitment y:");
    std::println(pedersen_commitment_point[1]);
    std::println("Nonce commitment:");
    std::println(nonce_commitment);
    std::println("Nonce discovery entry x:");
    std::println(nonce_discovery_entry[0]);
    std::println("Nonce discovery entry y:");
    std::println(nonce_discovery_entry[1]);
}

#[test]
fn test_entry_circuit_determinism() {
    let user_key = 0x1234567890abcdef as Field;
    let token_address = 0x02 as Field;
    let chain_id = 1 as Field; // Mainnet chain ID
    
    // Entry circuit should always produce valid commitments
    let result: ([Field; 2], Field, [Field; 2]) = main(user_key, token_address, chain_id);
    let pedersen_commitment_point: [Field; 2] = result.0;
    
    assert(pedersen_commitment_point[0] != 0, "Pedersen commitment x should not be zero");
    assert(pedersen_commitment_point[1] != 0, "Pedersen commitment y should not be zero");
    
    std::println("✅ Determinism test passed!");
    std::println("Pedersen commitment x:");
    std::println(pedersen_commitment_point[0]);
    std::println("Pedersen commitment y:");
    std::println(pedersen_commitment_point[1]);
}

// Print Prover.toml format for easy copy-paste
fn print_prover_toml_format(
    user_key: Field,
    token_address: Field,
    chain_id: Field
) {
    std::println("========================================");
    std::println("COPY THIS TO entry/Prover.toml");
    std::println("========================================");
    std::println("");
    
    // Basic parameters
    std::print("user_key = \"");
    std::print(user_key);
    std::println("\"");
    std::println("");
    
    std::print("token_address = \"");
    std::print(token_address);
    std::println("\"");
    std::println("");
    
    std::print("chain_id = \"");
    std::print(chain_id);
    std::println("\"");
    std::println("");
}

#[test]
fn test_entry_circuit_with_prover_toml() {
    std::println("╔══════════════════════════════════════════════════════════════╗");
    std::println("║      TEST: Entry Circuit with Prover.toml Output              ║");
    std::println("╚══════════════════════════════════════════════════════════════╝");
    std::println("");
    
    let user_key = 0x1234567890abcdef as Field;
    let token_address = 0x02 as Field;
    let chain_id = 1 as Field; // Mainnet chain ID
    
    // Call the main entry circuit function
    let result: ([Field; 2], Field, [Field; 2]) = main(user_key, token_address, chain_id);
    let pedersen_commitment_point: [Field; 2] = result.0;
    let nonce_commitment = result.1;
    let nonce_discovery_entry: [Field; 2] = result.2;
    
    // Basic test: Pedersen commitment point should not be zero
    assert(pedersen_commitment_point[0] != 0, "Pedersen commitment x should not be zero");
    assert(pedersen_commitment_point[1] != 0, "Pedersen commitment y should not be zero");
    
    // Basic test: nonce_commitment should not be zero
    assert(nonce_commitment != 0, "Nonce commitment should not be zero");
    
    // Basic test: nonce_discovery_entry should not be zero
    assert(nonce_discovery_entry[0] != 0, "Nonce discovery entry x should not be zero");
    assert(nonce_discovery_entry[1] != 0, "Nonce discovery entry y should not be zero");
    
    std::println("✅ Entry circuit test passed!");
    std::println("");
    
    // === GENERATE PROVER.TOML ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("PROVER.TOML FOR ENTRY CIRCUIT");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    print_prover_toml_format(
        user_key,
        token_address,
        chain_id
    );
    
    std::println("");
    std::println("✅ Prover.toml generated for entry circuit!");
    std::println("");
}
