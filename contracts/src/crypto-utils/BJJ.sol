// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/**
 * @title BJJ
 * @dev Gas-optimized Baby Jubjub curve point operations
 * @notice This library provides basic point addition and scalar multiplication for Baby Jubjub curve
 * Curve equation: ax² + y² = 1 + dx²y² where a = 168700, d = 168696
 * Field modulus: BN254 scalar field (Fr)
 */
library BJJ {
    // Baby Jubjub field modulus (BN254 scalar field)
    uint256 private constant P_MOD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

    // Baby Jubjub curve parameters
    uint256 private constant A = 168700;
    uint256 private constant D = 168696;

    struct Point {
        uint256 x;
        uint256 y;
    }

    /**
     * @dev Add two Baby Jubjub points (gas optimized)
     * Uses EVM's modexp precompile (0x05) for inverse calculation
     * Formula:
     *   beta = x1*y2
     *   gamma = y1*x2
     *   delta = (-a*x1 + y1) * (x2 + y2)
     *   tau = beta * gamma
     *   xout = (beta + gamma) / (1 + d*tau)
     *   yout = (delta + a*beta - gamma) / (1 - d*tau)
     */
    function add(Point memory p1, Point memory p2) internal view returns (Point memory r) {
        assembly {
            function point_add(x1, y1, x2, y2) -> rx, ry {
                let p := 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001
                let a := 0x292fc // 168700
                let d := 0x292f8 // 168696

                // Handle point at infinity (0, 1) - Baby Jubjub identity
                if and(iszero(x1), eq(y1, 1)) {
                    rx := x2
                    ry := y2
                    leave
                }
                if and(iszero(x2), eq(y2, 1)) {
                    rx := x1
                    ry := y1
                    leave
                }

                // Compute beta = x1 * y2
                let beta := mulmod(x1, y2, p)

                // Compute gamma = y1 * x2
                let gamma := mulmod(y1, x2, p)

                // Compute delta = (-a*x1 + y1) * (x2 + y2)
                let ax1 := mulmod(a, x1, p)
                let neg_ax1 := sub(p, ax1)
                let neg_ax1_plus_y1 := addmod(neg_ax1, y1, p)
                let x2_plus_y2 := addmod(x2, y2, p)
                let delta := mulmod(neg_ax1_plus_y1, x2_plus_y2, p)

                // Compute tau = beta * gamma
                let tau := mulmod(beta, gamma, p)

                // Compute denominators
                let d_tau := mulmod(d, tau, p)
                let denom_x := addmod(1, d_tau, p)
                let denom_y := addmod(1, sub(p, d_tau), p)

                // Check for point at infinity (denominator = 0)
                if or(iszero(denom_x), iszero(denom_y)) {
                    rx := 0
                    ry := 1
                    leave
                }

                // Compute inverses using modexp precompile
                let memPtr := mload(0x40)

                // Inverse of denom_x
                mstore(memPtr, 0x20) // length of base
                mstore(add(memPtr, 0x20), 0x20) // length of exponent
                mstore(add(memPtr, 0x40), 0x20) // length of modulus
                mstore(add(memPtr, 0x60), denom_x) // base
                mstore(add(memPtr, 0x80), sub(p, 2)) // exponent = p - 2
                mstore(add(memPtr, 0xa0), p) // modulus

                let success := staticcall(gas(), 0x05, memPtr, 0xc0, memPtr, 0x20)
                if iszero(success) {
                    revert(0, 0)
                }
                let inv_x := mload(memPtr)

                // Inverse of denom_y - use fresh memory location
                let memPtr2 := add(memPtr, 0xc0)
                mstore(memPtr2, 0x20) // length of base
                mstore(add(memPtr2, 0x20), 0x20) // length of exponent
                mstore(add(memPtr2, 0x40), 0x20) // length of modulus
                mstore(add(memPtr2, 0x60), denom_y) // base
                mstore(add(memPtr2, 0x80), sub(p, 2)) // exponent = p - 2
                mstore(add(memPtr2, 0xa0), p) // modulus

                success := staticcall(gas(), 0x05, memPtr2, 0xc0, memPtr2, 0x20)
                if iszero(success) {
                    revert(0, 0)
                }
                let inv_y := mload(memPtr2)

                // Compute xout = (beta + gamma) * inv_x
                let beta_plus_gamma := addmod(beta, gamma, p)
                rx := mulmod(beta_plus_gamma, inv_x, p)

                // Compute yout = (delta + a*beta - gamma) * inv_y
                let a_beta := mulmod(a, beta, p)
                let delta_plus_a_beta := addmod(delta, a_beta, p)
                let delta_plus_a_beta_minus_gamma := addmod(delta_plus_a_beta, sub(p, gamma), p)
                ry := mulmod(delta_plus_a_beta_minus_gamma, inv_y, p)
            }

            let x1 := mload(p1)
            let y1 := mload(add(p1, 0x20))
            let x2 := mload(p2)
            let y2 := mload(add(p2, 0x20))

            let rx, ry := point_add(x1, y1, x2, y2)

            mstore(r, rx)
            mstore(add(r, 0x20), ry)
        }
    }

    /**
     * @dev Scalar multiplication using double-and-add
     */
    function mul(Point memory p, uint256 scalar) internal view returns (Point memory r) {
        r = Point(0, 1); // Point at infinity (identity)
        Point memory temp = p;

        while (scalar > 0) {
            if (scalar & 1 == 1) {
                r = add(r, temp);
            }
            temp = add(temp, temp);
            scalar >>= 1;
        }
    }

    /**
     * @dev Check if two points are equal
     */
    function eq(Point memory p1, Point memory p2) internal pure returns (bool) {
        return p1.x == p2.x && p1.y == p2.y;
    }

    /**
     * @dev Check if a point is the zero point (identity: 0, 1)
     */
    function isZero(Point memory p) internal pure returns (bool) {
        return p.x == 0 && p.y == 1;
    }

    /**
     * @dev Negate a point (point at infinity remains unchanged)
     * For Edwards curve: -(x, y) = (-x, y)
     */
    function negate(Point memory p) internal pure returns (Point memory) {
        if (p.x == 0 && p.y == 1) {
            return p; // Point at infinity
        }
        uint256 p_mod = 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001;
        return Point(addmod(0, p_mod - p.x, p_mod), p.y);
    }

    /**
     * @dev Compute Pedersen commitment single term
     * Optimized convenience function for note stack commitments
     * @param G Generator point
     * @param scalar Scalar multiplier
     * @return term The resulting commitment point
     */
    function getTerm(Point memory G, uint256 scalar) internal view returns (Point memory term) {
        // Compute scalar * G
        term = mul(G, scalar);
    }
}

