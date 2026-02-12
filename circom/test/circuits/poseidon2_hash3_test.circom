pragma circom 2.0.0;
include "../../lib/poseidon/poseidon2.circom";

template Poseidon2Hash3Test() {
    signal input in[3];
    signal output out;
    
    component hash = Poseidon2Hash3();
    hash.in[0] <== in[0];
    hash.in[1] <== in[1];
    hash.in[2] <== in[2];
    out <== hash.out;
}

component main = Poseidon2Hash3Test();
