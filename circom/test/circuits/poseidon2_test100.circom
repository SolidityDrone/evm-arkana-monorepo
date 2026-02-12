pragma circom 2.0.0;

include "../lib/poseidon/poseidon2.circom";

// Test 3: 100-hash chain
// This creates a chain of 100 Poseidon2Hash1 calls
template Poseidon2Test100() {
    signal input in;
    signal output out;
    
    // Chain 100 hashes
    component hash[100];
    
    hash[0] = Poseidon2Hash1();
    hash[0].in <== in;
    
    for (var i = 1; i < 100; i++) {
        hash[i] = Poseidon2Hash1();
        hash[i].in <== hash[i-1].out;
    }
    
    out <== hash[99].out;
}

component main = Poseidon2Test100();

