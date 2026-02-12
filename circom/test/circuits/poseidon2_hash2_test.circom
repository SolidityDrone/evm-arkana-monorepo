pragma circom 2.0.0;
include "../../lib/poseidon/poseidon2.circom";

template Poseidon2Hash2Test() {
    signal input in[2];
    signal output out;
    
    component hash = Poseidon2Hash2();
    hash.in[0] <== in[0];
    hash.in[1] <== in[1];
    out <== hash.out;
}

component main = Poseidon2Hash2Test();
