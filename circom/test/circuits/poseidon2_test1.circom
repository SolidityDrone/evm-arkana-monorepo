pragma circom 2.0.0;

include "../lib/poseidon/poseidon2.circom";

// Test 1: Hash single value (0x10)
template Poseidon2Test1() {
    signal input in;
    signal output out;
    
    component hash = Poseidon2Hash1();
    hash.in <== in;
    out <== hash.out;
}

component main = Poseidon2Test1();

