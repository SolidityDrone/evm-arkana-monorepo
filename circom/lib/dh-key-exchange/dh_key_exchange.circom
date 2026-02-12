pragma circom 2.0.0;

include "../poseidon/poseidon2.circom";
include "../../node_modules/circomlib/circuits/escalarmulany.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";

// Diffie-Hellman key exchange over Baby Jubjub
// Matches Noir's dh-key-exchange implementation

// Perform Diffie-Hellman key exchange
// @param sender_private_key The sender's private key (user_key + nonce, can be up to 254 bits)
// @param receiver_public_key The receiver's public key as [x, y]
// @return sender_public_key [x, y] coordinates of the sender's public key
// @return shared_key The hashed shared secret
template PerformDHKeyExchange() {
    signal input sender_private_key;
    signal input receiver_public_key[2];  // [x, y]
    signal output sender_public_key[2];    // [x, y]
    signal output shared_key;
    
    // Baby Jubjub generator (base8) - standard generator for Baby Jubjub
    // From EIP-2494: https://eips.ethereum.org/EIPS/eip-2494
    var BASE8_X = 5299619240641551281634865583518297030282874472190772894086521144482721001553;
    var BASE8_Y = 16950150798460657717958625567821834550301663161624707787222815936182638968203;
    
    // Convert sender_private_key to bits for EscalarMulAny
    // sender_private_key = user_key + nonce, so it can be up to 254 bits
    component sender_key_bits = Num2Bits(254);
    sender_key_bits.in <== sender_private_key;
    
    // Generate sender's public key: sender_pub_key = sender_private_key * BASE8
    component sender_pub_key_mul = EscalarMulAny(254);
    for (var i = 0; i < 254; i++) {
        sender_pub_key_mul.e[i] <== sender_key_bits.out[i];
    }
    sender_pub_key_mul.p[0] <== BASE8_X;
    sender_pub_key_mul.p[1] <== BASE8_Y;
    
    sender_public_key[0] <== sender_pub_key_mul.out[0];
    sender_public_key[1] <== sender_pub_key_mul.out[1];
    
    // Compute shared secret: shared_secret = sender_private_key * receiver_public_key
    // Reuse the same sender_key_bits for efficiency
    component shared_secret_mul = EscalarMulAny(254);
    for (var i = 0; i < 254; i++) {
        shared_secret_mul.e[i] <== sender_key_bits.out[i];
    }
    shared_secret_mul.p[0] <== receiver_public_key[0];
    shared_secret_mul.p[1] <== receiver_public_key[1];
    
    // Hash the shared secret to get a final shared key
    component hash = Poseidon2Hash2();
    hash.in[0] <== shared_secret_mul.out[0];
    hash.in[1] <== shared_secret_mul.out[1];
    shared_key <== hash.out;
}

