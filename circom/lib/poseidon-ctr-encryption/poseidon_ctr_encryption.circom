pragma circom 2.0.0;

include "../poseidon/poseidon2.circom";

// Poseidon CTR Mode Encryption Library
// Matches Noir's poseidon-ctr-encryption implementation

// Generate a keystream using Poseidon with key and nonce
template PoseidonKeystream() {
    signal input key;
    signal input nonce;
    signal output keystream;
    
    // Use Poseidon2 to hash key and nonce
    component hash = Poseidon2Hash2();
    hash.in[0] <== key;
    hash.in[1] <== nonce;
    keystream <== hash.out;
}

// Encrypt a single field using Poseidon CTR mode
template PoseidonCTREncrypt() {
    signal input plaintext;
    signal input key;
    signal input counter;
    signal output ciphertext;
    
    // Generate keystream
    component keystream_gen = PoseidonKeystream();
    keystream_gen.key <== key;
    keystream_gen.nonce <== counter;
    
    // Encrypt by adding keystream to plaintext (field arithmetic equivalent of XOR)
    ciphertext <== plaintext + keystream_gen.keystream;
}

// Decrypt a single field using Poseidon CTR mode
template PoseidonCTRDecrypt() {
    signal input ciphertext;
    signal input key;
    signal input counter;
    signal output plaintext;
    
    // Generate the same keystream
    component keystream_gen = PoseidonKeystream();
    keystream_gen.key <== key;
    keystream_gen.nonce <== counter;
    
    // Decrypt by subtracting keystream from ciphertext
    plaintext <== ciphertext - keystream_gen.keystream;
}

// Encrypt all four fields (amount, token_address, ref, encryption_key) in one function call
// This provides integrity checking - the ref value can be verified when absorbing the note
template PoseidonEncryptAllFields() {
    signal input amount;
    signal input token_address;
    signal input ref;
    signal input encryption_key;
    signal output encrypted_amount;
    signal output encrypted_token_address;
    signal output encrypted_ref;
    signal output encrypted_key;
    
    // Encrypt each field with different counters
    component enc_amount = PoseidonCTREncrypt();
    enc_amount.plaintext <== amount;
    enc_amount.key <== encryption_key;
    enc_amount.counter <== 0;
    encrypted_amount <== enc_amount.ciphertext;
    
    component enc_token = PoseidonCTREncrypt();
    enc_token.plaintext <== token_address;
    enc_token.key <== encryption_key;
    enc_token.counter <== 1;
    encrypted_token_address <== enc_token.ciphertext;
    
    component enc_ref = PoseidonCTREncrypt();
    enc_ref.plaintext <== ref;
    enc_ref.key <== encryption_key;
    enc_ref.counter <== 2;
    encrypted_ref <== enc_ref.ciphertext;
    
    component enc_key = PoseidonCTREncrypt();
    enc_key.plaintext <== encryption_key;
    enc_key.key <== encryption_key;
    enc_key.counter <== 3;
    encrypted_key <== enc_key.ciphertext;
}

// Encrypt all four fields and return first 3 as array for cleaner API
template PoseidonEncryptAllFieldsArray() {
    signal input amount;
    signal input token_address;
    signal input ref;
    signal input encryption_key;
    signal output encrypted[3];
    
    // Encrypt all fields
    component enc_all = PoseidonEncryptAllFields();
    enc_all.amount <== amount;
    enc_all.token_address <== token_address;
    enc_all.ref <== ref;
    enc_all.encryption_key <== encryption_key;
    
    // Return first 3
    encrypted[0] <== enc_all.encrypted_amount;
    encrypted[1] <== enc_all.encrypted_token_address;
    encrypted[2] <== enc_all.encrypted_ref;
}

