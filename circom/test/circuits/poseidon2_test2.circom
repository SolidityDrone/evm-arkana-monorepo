pragma circom 2.0.0;

include "../lib/poseidon/poseidon2.circom";

// Test 2: 2-hash chain (hash the result of first hash)
template Poseidon2Test2() {
    signal input in;
    signal output out;
    
    component hash1 = Poseidon2Hash1();
    hash1.in <== in;
    
    component hash2 = Poseidon2Hash1();
    hash2.in <== hash1.out;
    
    out <== hash2.out;
}

component main = Poseidon2Test2();

