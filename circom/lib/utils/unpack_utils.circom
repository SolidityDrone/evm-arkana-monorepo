pragma circom 2.0.0;

// Unpacking utilities for withdraw circuit
// Matches circuits/main/withdraw/src/main.nr unpack_unlocks_at function

include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// Constants matching Noir
// UNLOCKS_AT_MASK = 0xffffff = 16777215 (24 bits)
// LOCK_TIMER_SHIFT_POWER = 0x1000000 = 16777216 (2^24)

/// Unpack unlocks_at Field into lock_timer and unlocks_at
/// @param packed: Packed Field containing lock_timer and unlocks_at
/// Format: 0xlock_timer000unlocks_at
/// - Last 24 bits: unlocks_at (timestamp when it can be used)
/// - Next 24 bits: lock_timer (duration in seconds)
/// @return (lock_timer, unlocks_at): Both as 24-bit values
template UnpackUnlocksAt() {
    signal input packed;
    signal output lock_timer;
    signal output unlocks_at;
    
    // Convert packed to bits
    component n2b = Num2Bits(254);
    n2b.in <== packed;
    
    // Extract unlocks_at: last 24 bits (bits 0-23)
    // Reconstruct from bits
    component b2n_unlocks = Bits2Num(24);
    for (var i = 0; i < 24; i++) {
        b2n_unlocks.in[i] <== n2b.out[i];
    }
    unlocks_at <== b2n_unlocks.out;
    
    // Extract lock_timer: next 24 bits (bits 24-47)
    component b2n_lock = Bits2Num(24);
    for (var i = 0; i < 24; i++) {
        b2n_lock.in[i] <== n2b.out[24 + i];
    }
    lock_timer <== b2n_lock.out;
}

