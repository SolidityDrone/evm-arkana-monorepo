pragma circom 2.0.0;
include "../../lib/pedersen-commitments/pedersen_commitments.circom";
include "../../lib/poseidon/poseidon2.circom";

template PedersenCommitment5Test() {
    signal input m1;
    signal input m2;
    signal input m3;
    signal input m4;
    signal input r;
    signal output commitment_point[2];
    signal output leaf;
    
    component commit = PedersenCommitment5();
    commit.m1 <== m1;
    commit.m2 <== m2;
    commit.m3 <== m3;
    commit.m4 <== m4;
    commit.r <== r;
    
    commitment_point[0] <== commit.commitment[0];
    commitment_point[1] <== commit.commitment[1];
    
    component hash = Poseidon2Hash2();
    hash.in[0] <== commit.commitment[0];
    hash.in[1] <== commit.commitment[1];
    leaf <== hash.out;
}

component main = PedersenCommitment5Test();

