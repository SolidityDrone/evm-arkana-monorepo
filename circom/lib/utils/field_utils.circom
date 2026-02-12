pragma circom 2.0.0;

// Field comparison utilities matching Noir's std::field::bn254::{lt,gt}

include "../../node_modules/circomlib/circuits/comparators.circom";

// Less than: returns 1 if a < b, 0 otherwise
template LessThanField() {
    signal input a;
    signal input b;
    signal output out;
    
    // Use LessThan with 252 bits (max allowed, field size is 254 but LessThan max is 252)
    component lt = LessThan(252);
    lt.in[0] <== a;
    lt.in[1] <== b;
    out <== lt.out;
}

// Greater than: returns 1 if a > b, 0 otherwise
template GreaterThanField() {
    signal input a;
    signal input b;
    signal output out;
    
    // a > b is equivalent to b < a
    component lt = LessThan(252);
    lt.in[0] <== b;
    lt.in[1] <== a;
    out <== lt.out;
}

// Greater than or equal: returns 1 if a >= b, 0 otherwise
template GreaterThanOrEqualField() {
    signal input a;
    signal input b;
    signal output out;
    
    // a >= b is equivalent to !(b > a) which is !(a < b)
    component lt = LessThan(252);
    lt.in[0] <== a;
    lt.in[1] <== b;
    out <== 1 - lt.out;
}

