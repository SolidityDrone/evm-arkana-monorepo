pragma circom 2.0.0;

// Poseidon CTR mode encryption: ciphertext = plaintext + Poseidon(key, counter)
// Matches frontend poseidon-ctr-encryption.ts and Noir poseidon_keystream/poseidon_ctr_encrypt

include "../poseidon/poseidon.circom";

template PoseidonCTREncrypt() {
    signal input plaintext;
    signal input key;
    signal input counter;
    signal output ciphertext;

    component keystream = Poseidon2Hash2();
    keystream.in[0] <== key;
    keystream.in[1] <== counter;
    ciphertext <== plaintext + keystream.out;
}
