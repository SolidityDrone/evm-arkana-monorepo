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

// Test circuit for Poseidon2Hash2
template Poseidon2Hash2Test() {
    signal input in[2];
    signal output out;
    
    component hash = Poseidon2Hash2();
    hash.in[0] <== in[0];
    hash.in[1] <== in[1];
    out <== hash.out;
}

// Test circuit for Poseidon2Hash3
template Poseidon2Hash3Test() {
    signal input in[3];
    signal output out;
    
    component hash = Poseidon2Hash3();
    hash.in[0] <== in[0];
    hash.in[1] <== in[1];
    hash.in[2] <== in[2];
    out <== hash.out;
}

// Main test component
component main = Poseidon2Hash1Test();

