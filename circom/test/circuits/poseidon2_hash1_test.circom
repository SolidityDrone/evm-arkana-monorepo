pragma circom 2.0.0;

include "../lib/poseidon/poseidon2.circom";

// Test circuit for Poseidon2Hash1
template Poseidon2Hash1Test() {
    signal input in;
    signal output out;
    
    component hash = Poseidon2Hash1();
    hash.in <== in;
    out <== hash.out;
}

component main = Poseidon2Hash1Test();

