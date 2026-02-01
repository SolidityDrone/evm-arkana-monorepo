use dep::ec::consts::te::{baby_jubjub};
use dep::poseidon::poseidon2::Poseidon2;
use dep::ec::tecurve::affine::{Point};

// Generate public key from private key
fn generate_public_key(private_key: Field) -> [Field; 2] {
    let bjj = baby_jubjub();
    let generator = bjj.base8;
    let public_key = bjj.curve.mul(private_key, generator);
    [public_key.x, public_key.y]
}

// Perform Diffie-Hellman key exchange (copied from library for testing)
fn perform_dh_key_exchange(sender_private_key: Field, receiver_public_key: [Field; 2]) -> ([Field; 2], Field) {
    let bjj = baby_jubjub();
    let generator = bjj.base8;
    let sender_public_key = bjj.curve.mul(sender_private_key, generator);
    let receiver_pub_key = Point::new(receiver_public_key[0], receiver_public_key[1]);
    let shared_secret = bjj.curve.mul(sender_private_key, receiver_pub_key);
    let shared_key = Poseidon2::hash([shared_secret.x, shared_secret.y], 2);
    ([sender_public_key.x, sender_public_key.y], shared_key)
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
    
    // Verify Bob's public key is valid (at least one coordinate is non-zero)
    // Use bitwise OR to check that at least one coordinate is non-zero
    let pub_key_valid = (bob_public_key[0] != 0) | (bob_public_key[1] != 0);
    assert(pub_key_valid);
    
    // Verify shared key is valid (non-zero)
    assert(shared_key != 0);
    
    // Verify the shared key is the same when computed from Alice's side
    // Alice performs DH with Bob's public key
    let (alice_computed_pub_key, alice_shared_key) = perform_dh_key_exchange(alice_private_key, bob_public_key);
    
    // Verify both sides compute the same shared key
    assert(shared_key == alice_shared_key);
    
    // Verify Alice's computed public key matches her original public key
    assert(alice_computed_pub_key[0] == alice_public_key[0]);
    assert(alice_computed_pub_key[1] == alice_public_key[1]);
}
