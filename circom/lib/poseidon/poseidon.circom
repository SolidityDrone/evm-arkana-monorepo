pragma circom 2.0.0;

// Poseidon hashing using circomlib (same API as previous Poseidon2Hash* for drop-in replacement).
include "../../node_modules/circomlib/circuits/poseidon.circom";

template Poseidon2Hash1() {
    signal input in;
    signal output out;
    component p = Poseidon(1);
    p.inputs[0] <== in;
    out <== p.out;
}

template Poseidon2Hash2() {
    signal input in[2];
    signal output out;
    component p = Poseidon(2);
    p.inputs[0] <== in[0];
    p.inputs[1] <== in[1];
    out <== p.out;
}

template Poseidon2Hash3() {
    signal input in[3];
    signal output out;
    component p = Poseidon(3);
    p.inputs[0] <== in[0];
    p.inputs[1] <== in[1];
    p.inputs[2] <== in[2];
    out <== p.out;
}

template Poseidon2Hash4() {
    signal input in[4];
    signal output out;
    component p = Poseidon(4);
    p.inputs[0] <== in[0];
    p.inputs[1] <== in[1];
    p.inputs[2] <== in[2];
    p.inputs[3] <== in[3];
    out <== p.out;
}

template Poseidon2Hash5() {
    signal input in[5];
    signal output out;
    component p = Poseidon(5);
    p.inputs[0] <== in[0];
    p.inputs[1] <== in[1];
    p.inputs[2] <== in[2];
    p.inputs[3] <== in[3];
    p.inputs[4] <== in[4];
    out <== p.out;
}
