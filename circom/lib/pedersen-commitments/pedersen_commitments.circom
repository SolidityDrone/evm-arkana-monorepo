pragma circom 2.0.0;

// Pedersen Commitments using Baby Jubjub curve
// Baby Jubjub is embedded in Fr (BN254 scalar field), so Circom can do native arithmetic

include "../../node_modules/circomlib/circuits/babyjub.circom";
include "../../node_modules/circomlib/circuits/escalarmulany.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";

/**
 * PedersenCommitment2: m*G + r*H
 * Used for 2-generator commitments (e.g., nonce discovery, note commitments)
 */
template PedersenCommitment2() {
    signal input m;  // Message (amount)
    signal input r;  // Randomness (nonce_commitment or hash)
    signal output commitment[2];  // [x, y] point on Baby Jubjub
    
    // Convert m and r to bits for EscalarMulAny
    // m: amounts, use 128 bits (consistent with other Pedersen commitments)
    // r: hash output, use 254 bits to be safe
    component m_bits = Num2Bits(128);
    m_bits.in <== m;
    
    component r_bits = Num2Bits(254);
    r_bits.in <== r;
    
    // Generator constants for PedersenCommitment2 (Baby Jubjub)
    // Using circomlib's Pedersen generators (hardcoded for EscalarMulFix)
    var GENERATOR_G_2_X = 10457101036533406547632367118273992217979173478358440826365724437999023779287;
    var GENERATOR_G_2_Y = 19824078218392094440610104313265183977899662750282163392862422243483260492317;
    var GENERATOR_H_2_X = 2671756056509184035029146175565761955751135805354291559563293617232983272177;
    var GENERATOR_H_2_Y = 2663205510731142763556352975002641716101654201788071096152948830924149045094;
    
    // Compute m*G (using 128 bits)
    component mG = EscalarMulAny(128);
    for (var i = 0; i < 128; i++) {
        mG.e[i] <== m_bits.out[i];
    }
    mG.p[0] <== GENERATOR_G_2_X;
    mG.p[1] <== GENERATOR_G_2_Y;
    
    // Compute r*H (using 254 bits)
    component rH = EscalarMulAny(254);
    for (var i = 0; i < 254; i++) {
        rH.e[i] <== r_bits.out[i];
    }
    rH.p[0] <== GENERATOR_H_2_X;
    rH.p[1] <== GENERATOR_H_2_Y;
    
    // Add: m*G + r*H
    component add = BabyAdd();
    add.x1 <== mG.out[0];
    add.y1 <== mG.out[1];
    add.x2 <== rH.out[0];
    add.y2 <== rH.out[1];
    
    commitment[0] <== add.xout;
    commitment[1] <== add.yout;
}

/**
 * PedersenCommitment2FixedM1: G + r*H (optimized for m=1)
 * When m=1, we have 1*G = G, so we can use the generator directly
 * This saves Num2Bits(64) + EscalarMulAny(64) ≈ 5000-10000 constraints
 * Used for nonce discovery entries where m is always 1
 */
template PedersenCommitment2FixedM1() {
    signal input r;  // Randomness (nonce_commitment)
    signal output commitment[2];  // [x, y] point on Baby Jubjub
    
    // Convert r to bits for EscalarMulAny
    component r_bits = Num2Bits(254);
    r_bits.in <== r;
    
    // Generator constants (Baby Jubjub)
    var GENERATOR_G_X = 10457101036533406547632367118273992217979173478358440826365724437999023779287;
    var GENERATOR_G_Y = 19824078218392094440610104313265183977899662750282163392862422243483260492317;
    var GENERATOR_H_X = 2671756056509184035029146175565761955751135805354291559563293617232983272177;
    var GENERATOR_H_Y = 2663205510731142763556352975002641716101654201788071096152948830924149045094;
    
    // Since m=1, we have 1*G = G (the generator itself)
    // No need to compute scalar multiplication, just use G directly
    
    // Compute r*H (using 254 bits)
    component rH = EscalarMulAny(254);
    for (var i = 0; i < 254; i++) {
        rH.e[i] <== r_bits.out[i];
    }
    rH.p[0] <== GENERATOR_H_X;
    rH.p[1] <== GENERATOR_H_Y;
    
    // Add: G + r*H (G is a constant, so we just add it directly)
    component add = BabyAdd();
    add.x1 <== GENERATOR_G_X;
    add.y1 <== GENERATOR_G_Y;
    add.x2 <== rH.out[0];
    add.y2 <== rH.out[1];
    
    commitment[0] <== add.xout;
    commitment[1] <== add.yout;
}

/**
 * PedersenCommitmentBase4: m1*G + m2*H + m3*D + m4*K (without r*J)
 * Optimized version that computes only the base part (4 generators)
 * Used when we need to compute multiple commitments with different r values
 */
template PedersenCommitmentBase4() {
    signal input m1;  // shares
    signal input m2;  // nullifier
    signal input m3;  // spending_key
    signal input m4;  // unlocks_at
    signal output commitment[2];  // [x, y] point on Baby Jubjub
    
    // Convert inputs to bits for EscalarMulAny
    component m1_bits = Num2Bits(128);
    m1_bits.in <== m1;
    
    component m2_bits = Num2Bits(128);
    m2_bits.in <== m2;
    
    component m3_bits = Num2Bits(254);
    m3_bits.in <== m3;
    
    component m4_bits = Num2Bits(24);
    m4_bits.in <== m4;
    
    // Generator constants
    var GENERATOR_G_X = 10457101036533406547632367118273992217979173478358440826365724437999023779287;
    var GENERATOR_G_Y = 19824078218392094440610104313265183977899662750282163392862422243483260492317;
    var GENERATOR_H_X = 2671756056509184035029146175565761955751135805354291559563293617232983272177;
    var GENERATOR_H_Y = 2663205510731142763556352975002641716101654201788071096152948830924149045094;
    var GENERATOR_D_X = 5802099305472655231388284418920769829666717045250560929368476121199858275951;
    var GENERATOR_D_Y = 5980429700218124965372158798884772646841287887664001482443826541541529227896;
    var GENERATOR_K_X = 7107336197374528537877327281242680114152313102022415488494307685842428166594;
    var GENERATOR_K_Y = 2857869773864086953506483169737724679646433914307247183624878062391496185654;
    
    // Compute m1*G, m2*H, m3*D, m4*K
    component m1G = EscalarMulAny(128);
    for (var i = 0; i < 128; i++) {
        m1G.e[i] <== m1_bits.out[i];
    }
    m1G.p[0] <== GENERATOR_G_X;
    m1G.p[1] <== GENERATOR_G_Y;
    
    component m2H = EscalarMulAny(128);
    for (var i = 0; i < 128; i++) {
        m2H.e[i] <== m2_bits.out[i];
    }
    m2H.p[0] <== GENERATOR_H_X;
    m2H.p[1] <== GENERATOR_H_Y;
    
    component m3D = EscalarMulAny(254);
    for (var i = 0; i < 254; i++) {
        m3D.e[i] <== m3_bits.out[i];
    }
    m3D.p[0] <== GENERATOR_D_X;
    m3D.p[1] <== GENERATOR_D_Y;
    
    component m4K = EscalarMulAny(24);
    for (var i = 0; i < 24; i++) {
        m4K.e[i] <== m4_bits.out[i];
    }
    m4K.p[0] <== GENERATOR_K_X;
    m4K.p[1] <== GENERATOR_K_Y;
    
    // Add all components: m1*G + m2*H + m3*D + m4*K
    component add1 = BabyAdd();
    add1.x1 <== m1G.out[0];
    add1.y1 <== m1G.out[1];
    add1.x2 <== m2H.out[0];
    add1.y2 <== m2H.out[1];
    
    component add2 = BabyAdd();
    add2.x1 <== add1.xout;
    add2.y1 <== add1.yout;
    add2.x2 <== m3D.out[0];
    add2.y2 <== m3D.out[1];
    
    component add3 = BabyAdd();
    add3.x1 <== add2.xout;
    add3.y1 <== add2.yout;
    add3.x2 <== m4K.out[0];
    add3.y2 <== m4K.out[1];
    
    commitment[0] <== add3.xout;
    commitment[1] <== add3.yout;
}

/**
 * PedersenCommitmentBase3: m2*H + m3*D + m4*K (without m1*G and r*J)
 * Optimized version that computes only the common part (3 generators)
 * Used when m1 changes between previous and new commitments (e.g., withdraw, send)
 * Then we add m1*G and r*J separately for each commitment
 */
template PedersenCommitmentBase3() {
    signal input m2;  // nullifier
    signal input m3;  // spending_key
    signal input m4;  // unlocks_at
    signal output commitment[2];  // [x, y] point on Baby Jubjub
    
    // Convert inputs to bits for EscalarMulAny
    component m2_bits = Num2Bits(128);
    m2_bits.in <== m2;
    
    component m3_bits = Num2Bits(254);
    m3_bits.in <== m3;
    
    component m4_bits = Num2Bits(24);
    m4_bits.in <== m4;
    
    // Generator constants
    var GENERATOR_H_X = 2671756056509184035029146175565761955751135805354291559563293617232983272177;
    var GENERATOR_H_Y = 2663205510731142763556352975002641716101654201788071096152948830924149045094;
    var GENERATOR_D_X = 5802099305472655231388284418920769829666717045250560929368476121199858275951;
    var GENERATOR_D_Y = 5980429700218124965372158798884772646841287887664001482443826541541529227896;
    var GENERATOR_K_X = 7107336197374528537877327281242680114152313102022415488494307685842428166594;
    var GENERATOR_K_Y = 2857869773864086953506483169737724679646433914307247183624878062391496185654;
    
    // Compute m2*H, m3*D, m4*K
    component m2H = EscalarMulAny(128);
    for (var i = 0; i < 128; i++) {
        m2H.e[i] <== m2_bits.out[i];
    }
    m2H.p[0] <== GENERATOR_H_X;
    m2H.p[1] <== GENERATOR_H_Y;
    
    component m3D = EscalarMulAny(254);
    for (var i = 0; i < 254; i++) {
        m3D.e[i] <== m3_bits.out[i];
    }
    m3D.p[0] <== GENERATOR_D_X;
    m3D.p[1] <== GENERATOR_D_Y;
    
    component m4K = EscalarMulAny(24);
    for (var i = 0; i < 24; i++) {
        m4K.e[i] <== m4_bits.out[i];
    }
    m4K.p[0] <== GENERATOR_K_X;
    m4K.p[1] <== GENERATOR_K_Y;
    
    // Add all components: m2*H + m3*D + m4*K
    component add1 = BabyAdd();
    add1.x1 <== m2H.out[0];
    add1.y1 <== m2H.out[1];
    add1.x2 <== m3D.out[0];
    add1.y2 <== m3D.out[1];
    
    component add2 = BabyAdd();
    add2.x1 <== add1.xout;
    add2.y1 <== add1.yout;
    add2.x2 <== m4K.out[0];
    add2.y2 <== m4K.out[1];
    
    commitment[0] <== add2.xout;
    commitment[1] <== add2.yout;
}

/**
 * PedersenCommitmentM1: m1*G (only the shares part)
 * Helper template to compute m1*G when we already have base3_commit (m2*H + m3*D + m4*K)
 * This allows reusing base3_commit for multiple commitments with different m1 values
 */
template PedersenCommitmentM1() {
    signal input m1;  // shares
    signal output commitment[2];  // [x, y] point on Baby Jubjub (m1*G)
    
    component m1_bits = Num2Bits(128);
    m1_bits.in <== m1;
    
    var GENERATOR_G_X = 10457101036533406547632367118273992217979173478358440826365724437999023779287;
    var GENERATOR_G_Y = 19824078218392094440610104313265183977899662750282163392862422243483260492317;
    
    component m1G = EscalarMulAny(128);
    for (var i = 0; i < 128; i++) {
        m1G.e[i] <== m1_bits.out[i];
    }
    m1G.p[0] <== GENERATOR_G_X;
    m1G.p[1] <== GENERATOR_G_Y;
    
    commitment[0] <== m1G.out[0];
    commitment[1] <== m1G.out[1];
}

/**
 * PedersenCommitmentR: r*J (only the nonce_commitment part)
 * Helper template to compute r*J when we already have base_commit (m1*G + m2*H + m3*D + m4*K)
 * This allows reusing base_commit for multiple commitments with different r values
 */
template PedersenCommitmentR() {
    signal input r;   // nonce_commitment
    signal output commitment[2];  // [x, y] point on Baby Jubjub (r*J)
    
    component r_bits = Num2Bits(254);
    r_bits.in <== r;
    
    // Generator J for nonce_commitment (Baby Jubjub)
    var GENERATOR_J_X = 20265828622013100949498132415626198973119240347465898028410217039057588424236;
    var GENERATOR_J_Y = 1160461593266035632937973507065134938065359936056410650153315956301179689506;
    
    // Compute r*J
    component rJ = EscalarMulAny(254);
    for (var i = 0; i < 254; i++) {
        rJ.e[i] <== r_bits.out[i];
    }
    rJ.p[0] <== GENERATOR_J_X;
    rJ.p[1] <== GENERATOR_J_Y;
    
    commitment[0] <== rJ.out[0];
    commitment[1] <== rJ.out[1];
}

/**
 * PedersenCommitment5: m1*G + m2*H + m3*D + m4*K + r*J
 * Used for balance commitments with:
 * - m1 = shares
 * - m2 = nullifier
 * - m3 = spending_key
 * - m4 = unlocks_at
 * - r = nonce_commitment
 */
template PedersenCommitment5() {
    signal input m1;  // shares
    signal input m2;  // nullifier
    signal input m3;  // spending_key
    signal input m4;  // unlocks_at
    signal input r;   // nonce_commitment
    signal output commitment[2];  // [x, y] point on Baby Jubjub
    
    // Convert inputs to bits for EscalarMulAny
    // Optimize: use smaller bit sizes for values that don't need 254 bits
    // m1 (shares): use 128 bits (supports up to 2^128 shares)
    // m2 (nullifier): use 128 bits (supports up to 2^128 nullifiers)
    // m3 (spending_key): needs 254 bits (field element)
    // m4 (unlocks_at): timestamp, use 24 bits (sufficient for ~194 days in seconds)
    // r (nonce_commitment): hash output, use 254 bits to be safe
    
    component m1_bits = Num2Bits(128);
    m1_bits.in <== m1;
    
    component m2_bits = Num2Bits(128);
    m2_bits.in <== m2;
    
    component m3_bits = Num2Bits(254);
    m3_bits.in <== m3;
    
    component m4_bits = Num2Bits(24);
    m4_bits.in <== m4;
    
    component r_bits = Num2Bits(254);
    r_bits.in <== r;
    
    // Generator constants for PedersenCommitment5 (Baby Jubjub)
    // Using circomlib's Pedersen generators
    var GENERATOR_G_X = 10457101036533406547632367118273992217979173478358440826365724437999023779287;
    var GENERATOR_G_Y = 19824078218392094440610104313265183977899662750282163392862422243483260492317;
    var GENERATOR_H_X = 2671756056509184035029146175565761955751135805354291559563293617232983272177;
    var GENERATOR_H_Y = 2663205510731142763556352975002641716101654201788071096152948830924149045094;
    var GENERATOR_D_X = 5802099305472655231388284418920769829666717045250560929368476121199858275951;
    var GENERATOR_D_Y = 5980429700218124965372158798884772646841287887664001482443826541541529227896;
    var GENERATOR_K_X = 7107336197374528537877327281242680114152313102022415488494307685842428166594;
    var GENERATOR_K_Y = 2857869773864086953506483169737724679646433914307247183624878062391496185654;
    var GENERATOR_J_X = 20265828622013100949498132415626198973119240347465898028410217039057588424236;
    var GENERATOR_J_Y = 1160461593266035632937973507065134938065359936056410650153315956301179689506;
    
    // Compute m1*G (using 128 bits)
    component m1G = EscalarMulAny(128);
    for (var i = 0; i < 128; i++) {
        m1G.e[i] <== m1_bits.out[i];
    }
    m1G.p[0] <== GENERATOR_G_X;
    m1G.p[1] <== GENERATOR_G_Y;
    
    // Compute m2*H (using 128 bits)
    component m2H = EscalarMulAny(128);
    for (var i = 0; i < 128; i++) {
        m2H.e[i] <== m2_bits.out[i];
    }
    m2H.p[0] <== GENERATOR_H_X;
    m2H.p[1] <== GENERATOR_H_Y;
    
    // Compute m3*D (using 254 bits)
    component m3D = EscalarMulAny(254);
    for (var i = 0; i < 254; i++) {
        m3D.e[i] <== m3_bits.out[i];
    }
    m3D.p[0] <== GENERATOR_D_X;
    m3D.p[1] <== GENERATOR_D_Y;
    
    // Compute m4*K (using 24 bits)
    component m4K = EscalarMulAny(24);
    for (var i = 0; i < 24; i++) {
        m4K.e[i] <== m4_bits.out[i];
    }
    m4K.p[0] <== GENERATOR_K_X;
    m4K.p[1] <== GENERATOR_K_Y;
    
    // Compute r*J (using 254 bits)
    component rJ = EscalarMulAny(254);
    for (var i = 0; i < 254; i++) {
        rJ.e[i] <== r_bits.out[i];
    }
    rJ.p[0] <== GENERATOR_J_X;
    rJ.p[1] <== GENERATOR_J_Y;
    
    // Add all components: m1*G + m2*H + m3*D + m4*K + r*J
    component add1 = BabyAdd();
    add1.x1 <== m1G.out[0];
    add1.y1 <== m1G.out[1];
    add1.x2 <== m2H.out[0];
    add1.y2 <== m2H.out[1];
    
    component add2 = BabyAdd();
    add2.x1 <== add1.xout;
    add2.y1 <== add1.yout;
    add2.x2 <== m3D.out[0];
    add2.y2 <== m3D.out[1];
    
    component add3 = BabyAdd();
    add3.x1 <== add2.xout;
    add3.y1 <== add2.yout;
    add3.x2 <== m4K.out[0];
    add3.y2 <== m4K.out[1];
    
    component add4 = BabyAdd();
    add4.x1 <== add3.xout;
    add4.y1 <== add3.yout;
    add4.x2 <== rJ.out[0];
    add4.y2 <== rJ.out[1];
    
    commitment[0] <== add4.xout;
    commitment[1] <== add4.yout;
}
