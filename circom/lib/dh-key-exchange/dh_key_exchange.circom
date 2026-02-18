pragma circom 2.0.0;

// ECDH on Baby Jubjub: shared_key = x(sender_private * receiver_public)
// Sender public key = sender_private * BASE8 (for disclosure to receiver)

include "../../node_modules/circomlib/circuits/babyjub.circom";
include "../../node_modules/circomlib/circuits/escalarmulany.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";

template PerformDHKeyExchange() {
    signal input sender_private_key;
    signal input receiver_public_key[2];
    signal output sender_public_key[2];
    signal output shared_key;

    // Sender's public key = sender_private_key * BASE8 (Baby Jubjub generator)
    component senderPub = BabyPbk();
    senderPub.in <== sender_private_key;
    sender_public_key[0] <== senderPub.Ax;
    sender_public_key[1] <== senderPub.Ay;

    // Shared point = sender_private_key * receiver_public_key (ECDH)
    component privBits = Num2Bits(254);
    privBits.in <== sender_private_key;
    component sharedPoint = EscalarMulAny(254);
    for (var i = 0; i < 254; i++) {
        sharedPoint.e[i] <== privBits.out[i];
    }
    sharedPoint.p[0] <== receiver_public_key[0];
    sharedPoint.p[1] <== receiver_public_key[1];
    shared_key <== sharedPoint.out[0];
}
