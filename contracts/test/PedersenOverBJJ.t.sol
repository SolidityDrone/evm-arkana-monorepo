// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/crypto-utils/BJJ.sol";
import "../src/crypto-utils/Generators.sol";

/**
 * @title PedersenOverBJJTest
 * @dev Test suite for Baby Jubjub curve point operations and Pedersen commitments
 */
contract PedersenOverBJJTest is Test {
    using BJJ for BJJ.Point;

    function setUp() public {}

    /**
     * @dev Test adding two points on the Baby Jubjub curve
     */
    function test_AddTwoPoints() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = Generators.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        // Get generator H
        (uint256 hX, uint256 hY) = Generators.getH();
        BJJ.Point memory H = BJJ.Point(hX, hY);

        // Add G + H
        BJJ.Point memory result = BJJ.add(G, H);

        // Assert result is not zero point
        assertFalse(BJJ.isZero(result), "Result should not be zero point");

        // Assert result is not equal to either input
        assertFalse(BJJ.eq(result, G), "Result should not equal G");
        assertFalse(BJJ.eq(result, H), "Result should not equal H");

        // Assert result coordinates are valid (non-zero)
        assertTrue(result.x != 0 || result.y != 1, "Result should have valid coordinates");
    }

    /**
     * @dev Test adding a point to itself (point doubling)
     */
    function test_AddPointToItself() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = Generators.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        // Add G + G (doubling)
        BJJ.Point memory doubled = BJJ.add(G, G);

        // Assert result is not zero point
        assertFalse(BJJ.isZero(doubled), "Doubled point should not be zero");

        // Assert result is not equal to original G
        assertFalse(BJJ.eq(doubled, G), "Doubled point should not equal original G");
    }

    /**
     * @dev Test creating a Pedersen commitment using getTerm
     */
    function test_CreatePedersenCommitmentWithGetTerm() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = Generators.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        // Create a term: scalar * G
        uint256 scalar = 12345;
        BJJ.Point memory term = BJJ.getTerm(G, scalar);

        // Assert term is not zero
        assertFalse(BJJ.isZero(term), "Term should not be zero point");

        // Assert term is not equal to G
        assertFalse(BJJ.eq(term, G), "Term should not equal generator G");
    }

    /**
     * @dev Test creating a Pedersen commitment with 5 values using all generators
     * Commitment = m1*G + m2*H + m3*D + m4*K + m5*J
     */
    function test_CreatePedersenCommitmentWithFiveTerms() public view {
        // Get all generators
        (uint256 gX, uint256 gY) = Generators.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        (uint256 hX, uint256 hY) = Generators.getH();
        BJJ.Point memory H = BJJ.Point(hX, hY);

        (uint256 dX, uint256 dY) = Generators.getD();
        BJJ.Point memory D = BJJ.Point(dX, dY);

        (uint256 kX, uint256 kY) = Generators.getK();
        BJJ.Point memory K = BJJ.Point(kX, kY);

        (uint256 jX, uint256 jY) = Generators.getJ();
        BJJ.Point memory J = BJJ.Point(jX, jY);

        // Define 5 scalar values
        uint256 m1 = 100; // shares
        uint256 m2 = 200; // nullifier
        uint256 m3 = 300; // spending_key
        uint256 m4 = 400; // unlocks_at
        uint256 m5 = 500; // nonce_commitment

        // Create 5 terms using getTerm
        BJJ.Point memory term1 = BJJ.getTerm(G, m1); // m1 * G
        BJJ.Point memory term2 = BJJ.getTerm(H, m2); // m2 * H
        BJJ.Point memory term3 = BJJ.getTerm(D, m3); // m3 * D
        BJJ.Point memory term4 = BJJ.getTerm(K, m4); // m4 * K
        BJJ.Point memory term5 = BJJ.getTerm(J, m5); // m5 * J

        // Assert all terms are non-zero
        assertFalse(BJJ.isZero(term1), "Term1 should not be zero");
        assertFalse(BJJ.isZero(term2), "Term2 should not be zero");
        assertFalse(BJJ.isZero(term3), "Term3 should not be zero");
        assertFalse(BJJ.isZero(term4), "Term4 should not be zero");
        assertFalse(BJJ.isZero(term5), "Term5 should not be zero");

        // Add all terms together to create the Pedersen commitment
        BJJ.Point memory commitment = BJJ.add(term1, term2);
        commitment = BJJ.add(commitment, term3);
        commitment = BJJ.add(commitment, term4);
        commitment = BJJ.add(commitment, term5);

        // Assert final commitment is not zero
        assertFalse(BJJ.isZero(commitment), "Final commitment should not be zero");

        // Assert commitment is not equal to any individual term
        assertFalse(BJJ.eq(commitment, term1), "Commitment should not equal term1");
        assertFalse(BJJ.eq(commitment, term2), "Commitment should not equal term2");
        assertFalse(BJJ.eq(commitment, term3), "Commitment should not equal term3");
        assertFalse(BJJ.eq(commitment, term4), "Commitment should not equal term4");
        assertFalse(BJJ.eq(commitment, term5), "Commitment should not equal term5");

        // Assert commitment coordinates are valid
        assertTrue(commitment.x != 0 || commitment.y != 1, "Commitment should have valid coordinates");
    }

    /**
     * @dev Test that adding a point and its negation results in zero point
     */
    function test_AddPointAndNegation() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = Generators.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        // Negate G
        BJJ.Point memory negG = BJJ.negate(G);

        // Add G + (-G) should equal zero point
        BJJ.Point memory result = BJJ.add(G, negG);

        // Assert result is zero point
        assertTrue(BJJ.isZero(result), "G + (-G) should equal zero point");
    }

    /**
     * @dev Test that getTerm with zero scalar returns zero point
     */
    function test_GetTermWithZeroScalar() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = Generators.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        // Create term with zero scalar
        BJJ.Point memory term = BJJ.getTerm(G, 0);

        // Assert term is zero point
        assertTrue(BJJ.isZero(term), "0 * G should equal zero point");
    }

    /**
     * @dev Test that getTerm with scalar 1 returns the generator itself
     */
    function test_GetTermWithScalarOne() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = Generators.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        // Create term with scalar 1
        BJJ.Point memory term = BJJ.getTerm(G, 1);

        // Assert term equals G
        assertTrue(BJJ.eq(term, G), "1 * G should equal G");
    }

    /**
     * @dev Test Pedersen commitment with different scalar values
     */
    function test_PedersenCommitmentWithDifferentScalars() public view {
        // Get all generators
        (uint256 gX, uint256 gY) = Generators.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        (uint256 hX, uint256 hY) = Generators.getH();
        BJJ.Point memory H = BJJ.Point(hX, hY);

        (uint256 dX, uint256 dY) = Generators.getD();
        BJJ.Point memory D = BJJ.Point(dX, dY);

        (uint256 kX, uint256 kY) = Generators.getK();
        BJJ.Point memory K = BJJ.Point(kX, kY);

        (uint256 jX, uint256 jY) = Generators.getJ();
        BJJ.Point memory J = BJJ.Point(jX, jY);

        // Test with different scalar values
        uint256[5] memory scalars = [uint256(1), uint256(2), uint256(3), uint256(4), uint256(5)];

        // Create terms
        BJJ.Point memory term1 = BJJ.getTerm(G, scalars[0]);
        BJJ.Point memory term2 = BJJ.getTerm(H, scalars[1]);
        BJJ.Point memory term3 = BJJ.getTerm(D, scalars[2]);
        BJJ.Point memory term4 = BJJ.getTerm(K, scalars[3]);
        BJJ.Point memory term5 = BJJ.getTerm(J, scalars[4]);

        // Add all terms
        BJJ.Point memory commitment1 = BJJ.add(term1, term2);
        commitment1 = BJJ.add(commitment1, term3);
        commitment1 = BJJ.add(commitment1, term4);
        commitment1 = BJJ.add(commitment1, term5);

        // Test with different scalar values
        uint256[5] memory scalars2 = [uint256(10), uint256(20), uint256(30), uint256(40), uint256(50)];

        // Create terms with new scalars
        BJJ.Point memory term1_2 = BJJ.getTerm(G, scalars2[0]);
        BJJ.Point memory term2_2 = BJJ.getTerm(H, scalars2[1]);
        BJJ.Point memory term3_2 = BJJ.getTerm(D, scalars2[2]);
        BJJ.Point memory term4_2 = BJJ.getTerm(K, scalars2[3]);
        BJJ.Point memory term5_2 = BJJ.getTerm(J, scalars2[4]);

        // Add all terms
        BJJ.Point memory commitment2 = BJJ.add(term1_2, term2_2);
        commitment2 = BJJ.add(commitment2, term3_2);
        commitment2 = BJJ.add(commitment2, term4_2);
        commitment2 = BJJ.add(commitment2, term5_2);

        // Assert both commitments are valid
        assertFalse(BJJ.isZero(commitment1), "Commitment1 should not be zero");
        assertFalse(BJJ.isZero(commitment2), "Commitment2 should not be zero");

        // Assert commitments are different (different scalars should produce different commitments)
        assertFalse(BJJ.eq(commitment1, commitment2), "Different scalars should produce different commitments");
    }
}

