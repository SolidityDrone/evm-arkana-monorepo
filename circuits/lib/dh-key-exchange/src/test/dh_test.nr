use dep::ec::consts::te::{baby_jubjub};
use crate::perform_dh_key_exchange;

// Generate public key from private key
fn generate_public_key(private_key: Field) -> [Field; 2] {
    let bjj = baby_jubjub();
    let generator = bjj.base8;
    let public_key = bjj.curve.mul(private_key, generator);
    [public_key.x, public_key.y]
}

#[test]
fn test_dh_key_exchange() {
    // Setup: Bob is sender, Alice is receiver
    let bob_private_key = 0x2b4c6d8e0f1a2b3c as Field;
    let alice_private_key = 0x1234567890abcdef as Field;
    
    // Generate Alice's public key
    let alice_public_key = generate_public_key(alice_private_key);
    
    // Bob performs DH key exchange with Alice's public key
    let (bob_public_key, shared_key) = perform_dh_key_exchange(bob_private_key, alice_public_key);
    
    // Verify Bob's public key is valid (non-zero)
    assert(bob_public_key[0] != 0 || bob_public_key[1] != 0, "Bob's public key should be non-zero");
    
    // Verify shared key is valid (non-zero)
    assert(shared_key != 0, "Shared key should be non-zero");
    
    // Verify the shared key is the same when computed from Alice's side
    // Alice performs DH with Bob's public key
    let (alice_computed_pub_key, alice_shared_key) = perform_dh_key_exchange(alice_private_key, bob_public_key);
    
    // Verify both sides compute the same shared key
    assert(shared_key == alice_shared_key, "Shared keys should match from both sides");
    
    // Verify Alice's computed public key matches her original public key
    assert(alice_computed_pub_key[0] == alice_public_key[0], "Alice's public key X should match");
    assert(alice_computed_pub_key[1] == alice_public_key[1], "Alice's public key Y should match");
}
