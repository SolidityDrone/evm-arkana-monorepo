// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/crypto-utils/Grumpkin.sol";
import "../src/crypto-utils/Generators.sol";

/**
 * @title PedersenOverGrumpkinTest
 * @dev Test suite for Grumpkin curve point operations and Pedersen commitments
 */
contract PedersenOverGrumpkinTest is Test {
    using Grumpkin for Grumpkin.G1Point;

    function setUp() public {}

    /**
     * @dev Test adding two points on the Grumpkin curve
     */
    function test_AddTwoPoints() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = Generators.getG();
        Grumpkin.G1Point memory G = Grumpkin.G1Point(gX, gY);

        // Get generator H
        (uint256 hX, uint256 hY) = Generators.getH();
        Grumpkin.G1Point memory H = Grumpkin.G1Point(hX, hY);

        // Add G + H
        Grumpkin.G1Point memory result = Grumpkin.add(G, H);

        // Assert result is not zero point
        assertFalse(Grumpkin.isZero(result), "Result should not be zero point");

        // Assert result is not equal to either input
        assertFalse(Grumpkin.eq(result, G), "Result should not equal G");
        assertFalse(Grumpkin.eq(result, H), "Result should not equal H");

        // Assert result coordinates are valid (non-zero)
        assertTrue(result.x != 0 || result.y != 0, "Result should have non-zero coordinates");
    }

    /**
     * @dev Test adding a point to itself (point doubling)
     */
    function test_AddPointToItself() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = Generators.getG();
        Grumpkin.G1Point memory G = Grumpkin.G1Point(gX, gY);

        // Add G + G (doubling)
        Grumpkin.G1Point memory doubled = Grumpkin.add(G, G);

        // Assert result is not zero point
        assertFalse(Grumpkin.isZero(doubled), "Doubled point should not be zero");

        // Assert result is not equal to original G
        assertFalse(Grumpkin.eq(doubled, G), "Doubled point should not equal original G");
    }

    /**
     * @dev Test creating a Pedersen commitment using getTerm
     */
    function test_CreatePedersenCommitmentWithGetTerm() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = Generators.getG();
        Grumpkin.G1Point memory G = Grumpkin.G1Point(gX, gY);

        // Create a term: scalar * G
        uint256 scalar = 12345;
        Grumpkin.G1Point memory term = Grumpkin.getTerm(G, scalar);

        // Assert term is not zero
        assertFalse(Grumpkin.isZero(term), "Term should not be zero point");

        // Assert term is not equal to G
        assertFalse(Grumpkin.eq(term, G), "Term should not equal generator G");
    }

    /**
     * @dev Test creating a Pedersen commitment with 5 values using all generators
     * Commitment = m1*G + m2*H + m3*D + m4*K + m5*J
     */
    function test_CreatePedersenCommitmentWithFiveTerms() public view {
        // Get all generators
        (uint256 gX, uint256 gY) = Generators.getG();
        Grumpkin.G1Point memory G = Grumpkin.G1Point(gX, gY);

        (uint256 hX, uint256 hY) = Generators.getH();
        Grumpkin.G1Point memory H = Grumpkin.G1Point(hX, hY);

        (uint256 dX, uint256 dY) = Generators.getD();
        Grumpkin.G1Point memory D = Grumpkin.G1Point(dX, dY);

        (uint256 kX, uint256 kY) = Generators.getK();
        Grumpkin.G1Point memory K = Grumpkin.G1Point(kX, kY);

        (uint256 jX, uint256 jY) = Generators.getJ();
        Grumpkin.G1Point memory J = Grumpkin.G1Point(jX, jY);

        // Define 5 scalar values
        uint256 m1 = 100; // shares
        uint256 m2 = 200; // nullifier
        uint256 m3 = 300; // spending_key
        uint256 m4 = 400; // unlocks_at
        uint256 m5 = 500; // nonce_commitment

        // Create 5 terms using getTerm
        Grumpkin.G1Point memory term1 = Grumpkin.getTerm(G, m1); // m1 * G
        Grumpkin.G1Point memory term2 = Grumpkin.getTerm(H, m2); // m2 * H
        Grumpkin.G1Point memory term3 = Grumpkin.getTerm(D, m3); // m3 * D
        Grumpkin.G1Point memory term4 = Grumpkin.getTerm(K, m4); // m4 * K
        Grumpkin.G1Point memory term5 = Grumpkin.getTerm(J, m5); // m5 * J

        // Assert all terms are non-zero
        assertFalse(Grumpkin.isZero(term1), "Term1 should not be zero");
        assertFalse(Grumpkin.isZero(term2), "Term2 should not be zero");
        assertFalse(Grumpkin.isZero(term3), "Term3 should not be zero");
        assertFalse(Grumpkin.isZero(term4), "Term4 should not be zero");
        assertFalse(Grumpkin.isZero(term5), "Term5 should not be zero");

        // Add all terms together to create the Pedersen commitment
        Grumpkin.G1Point memory commitment = Grumpkin.add(term1, term2);
        commitment = Grumpkin.add(commitment, term3);
        commitment = Grumpkin.add(commitment, term4);
        commitment = Grumpkin.add(commitment, term5);

        // Assert final commitment is not zero
        assertFalse(Grumpkin.isZero(commitment), "Final commitment should not be zero");

        // Assert commitment is not equal to any individual term
        assertFalse(Grumpkin.eq(commitment, term1), "Commitment should not equal term1");
        assertFalse(Grumpkin.eq(commitment, term2), "Commitment should not equal term2");
        assertFalse(Grumpkin.eq(commitment, term3), "Commitment should not equal term3");
        assertFalse(Grumpkin.eq(commitment, term4), "Commitment should not equal term4");
        assertFalse(Grumpkin.eq(commitment, term5), "Commitment should not equal term5");

        // Assert commitment coordinates are valid
        assertTrue(commitment.x != 0 || commitment.y != 0, "Commitment should have valid coordinates");
    }

    /**
     * @dev Test that adding a point and its negation results in zero point
     */
    function test_AddPointAndNegation() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = Generators.getG();
        Grumpkin.G1Point memory G = Grumpkin.G1Point(gX, gY);

        // Negate G
        Grumpkin.G1Point memory negG = Grumpkin.negate(G);

        // Add G + (-G) should equal zero point
        Grumpkin.G1Point memory result = Grumpkin.add(G, negG);

        // Assert result is zero point
        assertTrue(Grumpkin.isZero(result), "G + (-G) should equal zero point");
    }

    /**
     * @dev Test that getTerm with zero scalar returns zero point
     */
    function test_GetTermWithZeroScalar() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = Generators.getG();
        Grumpkin.G1Point memory G = Grumpkin.G1Point(gX, gY);

        // Create term with zero scalar
        Grumpkin.G1Point memory term = Grumpkin.getTerm(G, 0);

        // Assert term is zero point
        assertTrue(Grumpkin.isZero(term), "0 * G should equal zero point");
    }

    /**
     * @dev Test that getTerm with scalar 1 returns the generator itself
     */
    function test_GetTermWithScalarOne() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = Generators.getG();
        Grumpkin.G1Point memory G = Grumpkin.G1Point(gX, gY);

        // Create term with scalar 1
        Grumpkin.G1Point memory term = Grumpkin.getTerm(G, 1);

        // Assert term equals G
        assertTrue(Grumpkin.eq(term, G), "1 * G should equal G");
    }

    /**
     * @dev Test Pedersen commitment with different scalar values
     */
    function test_PedersenCommitmentWithDifferentScalars() public view {
        // Get all generators
        (uint256 gX, uint256 gY) = Generators.getG();
        Grumpkin.G1Point memory G = Grumpkin.G1Point(gX, gY);

        (uint256 hX, uint256 hY) = Generators.getH();
        Grumpkin.G1Point memory H = Grumpkin.G1Point(hX, hY);

        (uint256 dX, uint256 dY) = Generators.getD();
        Grumpkin.G1Point memory D = Grumpkin.G1Point(dX, dY);

        (uint256 kX, uint256 kY) = Generators.getK();
        Grumpkin.G1Point memory K = Grumpkin.G1Point(kX, kY);

        (uint256 jX, uint256 jY) = Generators.getJ();
        Grumpkin.G1Point memory J = Grumpkin.G1Point(jX, jY);

        // Test with different scalar values
        uint256[5] memory scalars = [uint256(1), uint256(2), uint256(3), uint256(4), uint256(5)];

        // Create terms
        Grumpkin.G1Point memory term1 = Grumpkin.getTerm(G, scalars[0]);
        Grumpkin.G1Point memory term2 = Grumpkin.getTerm(H, scalars[1]);
        Grumpkin.G1Point memory term3 = Grumpkin.getTerm(D, scalars[2]);
        Grumpkin.G1Point memory term4 = Grumpkin.getTerm(K, scalars[3]);
        Grumpkin.G1Point memory term5 = Grumpkin.getTerm(J, scalars[4]);

        // Add all terms
        Grumpkin.G1Point memory commitment1 = Grumpkin.add(term1, term2);
        commitment1 = Grumpkin.add(commitment1, term3);
        commitment1 = Grumpkin.add(commitment1, term4);
        commitment1 = Grumpkin.add(commitment1, term5);

        // Test with different scalar values
        uint256[5] memory scalars2 = [uint256(10), uint256(20), uint256(30), uint256(40), uint256(50)];

        // Create terms with new scalars
        Grumpkin.G1Point memory term1_2 = Grumpkin.getTerm(G, scalars2[0]);
        Grumpkin.G1Point memory term2_2 = Grumpkin.getTerm(H, scalars2[1]);
        Grumpkin.G1Point memory term3_2 = Grumpkin.getTerm(D, scalars2[2]);
        Grumpkin.G1Point memory term4_2 = Grumpkin.getTerm(K, scalars2[3]);
        Grumpkin.G1Point memory term5_2 = Grumpkin.getTerm(J, scalars2[4]);

        // Add all terms
        Grumpkin.G1Point memory commitment2 = Grumpkin.add(term1_2, term2_2);
        commitment2 = Grumpkin.add(commitment2, term3_2);
        commitment2 = Grumpkin.add(commitment2, term4_2);
        commitment2 = Grumpkin.add(commitment2, term5_2);

        // Assert both commitments are valid
        assertFalse(Grumpkin.isZero(commitment1), "Commitment1 should not be zero");
        assertFalse(Grumpkin.isZero(commitment2), "Commitment2 should not be zero");

        // Assert commitments are different (different scalars should produce different commitments)
        assertFalse(Grumpkin.eq(commitment1, commitment2), "Different scalars should produce different commitments");
    }
}

