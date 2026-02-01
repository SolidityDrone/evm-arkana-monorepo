use dep::poseidon::poseidon2::Poseidon2;
use dep::ec::tecurve::affine::{Point};
use dep::ec::consts::te::{baby_jubjub};

/// Perform Diffie-Hellman key exchange
/// @param sender_private_key The sender's private key
/// @param receiver_public_key The receiver's public key as [x, y]
/// @return A tuple of (sender_public_key, shared_key) where:
///         - sender_public_key is [x, y] coordinates of the sender's public key
///         - shared_key is the hashed shared secret
pub fn perform_dh_key_exchange(sender_private_key: Field, receiver_public_key: [Field; 2]) -> ([Field; 2], Field) {
    // Create Baby Jubjub curve for DH
    let bjj = baby_jubjub();
    let generator = bjj.base8;
    
    // Generate sender's public key: sender_pub_key = sender_private_key * generator
    let sender_public_key = bjj.curve.mul(sender_private_key, generator);
    
    // Reconstruct receiver's public key from the input
    let receiver_pub_key = Point::new(receiver_public_key[0], receiver_public_key[1]);
    
    // Compute shared secret: shared_secret = sender_private_key * receiver_public_key
    let shared_secret = bjj.curve.mul(sender_private_key, receiver_pub_key);
    
    // Hash the shared secret to get a final shared key
    let shared_key = Poseidon2::hash([shared_secret.x, shared_secret.y], 2);
    ([sender_public_key.x, sender_public_key.y], shared_key)
}

