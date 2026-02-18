// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/crypto-utils/BJJ.sol";

/**
 * @title GeneratorsFull
 * @dev All five generators (G, H, D, K, J) for tests. Arkana imports Generators only.
 */
library GeneratorsFull {
    uint256 public constant G_X = 10457101036533406547632367118273992217979173478358440826365724437999023779287;
    uint256 public constant G_Y = 19824078218392094440610104313265183977899662750282163392862422243483260492317;
    uint256 public constant H_X = 2671756056509184035029146175565761955751135805354291559563293617232983272177;
    uint256 public constant H_Y = 2663205510731142763556352975002641716101654201788071096152948830924149045094;
    uint256 public constant D_X = 5802099305472655231388284418920769829666717045250560929368476121199858275951;
    uint256 public constant D_Y = 5980429700218124965372158798884772646841287887664001482443826541541529227896;
    uint256 public constant K_X = 7107336197374528537877327281242680114152313102022415488494307685842428166594;
    uint256 public constant K_Y = 2857869773864086953506483169737724679646433914307247183624878062391496185654;
    uint256 public constant J_X = 20265828622013100949498132415626198973119240347465898028410217039057588424236;
    uint256 public constant J_Y = 1160461593266035632937973507065134938065359936056410650153315956301179689506;

    function getG() internal pure returns (uint256 x, uint256 y) {
        return (G_X, G_Y);
    }

    function getH() internal pure returns (uint256 x, uint256 y) {
        return (H_X, H_Y);
    }

    function getD() internal pure returns (uint256 x, uint256 y) {
        return (D_X, D_Y);
    }

    function getK() internal pure returns (uint256 x, uint256 y) {
        return (K_X, K_Y);
    }

    function getJ() internal pure returns (uint256 x, uint256 y) {
        return (J_X, J_Y);
    }
}

/**
 * @title PedersenOverBJJTest
 * @dev Test suite for Baby Jubjub curve point operations and Pedersen commitments
 */
contract PedersenOverBJJTest is Test {
    using BJJ for BJJ.Point;

    uint256 private constant P_MOD = 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001;

    function _bjjEq(BJJ.Point memory p1, BJJ.Point memory p2) internal pure returns (bool) {
        return p1.x == p2.x && p1.y == p2.y;
    }

    function _bjjIsZero(BJJ.Point memory p) internal pure returns (bool) {
        return p.x == 0 && p.y == 1;
    }

    function _bjjNegate(BJJ.Point memory p) internal pure returns (BJJ.Point memory) {
        if (p.x == 0 && p.y == 1) return p;
        return BJJ.Point(addmod(0, P_MOD - p.x, P_MOD), p.y);
    }

    function setUp() public {}

    /**
     * @dev Test adding two points on the Baby Jubjub curve
     */
    function test_AddTwoPoints() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = GeneratorsFull.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        // Get generator H
        (uint256 hX, uint256 hY) = GeneratorsFull.getH();
        BJJ.Point memory H = BJJ.Point(hX, hY);

        // Add G + H
        BJJ.Point memory result = BJJ.add(G, H);

        // Assert result is not zero point
        assertFalse(_bjjIsZero(result), "Result should not be zero point");

        // Assert result is not equal to either input
        assertFalse(_bjjEq(result, G), "Result should not equal G");
        assertFalse(_bjjEq(result, H), "Result should not equal H");

        // Assert result coordinates are valid (non-zero)
        assertTrue(result.x != 0 || result.y != 1, "Result should have valid coordinates");
    }

    /**
     * @dev Compute and log the default nonce discovery point (G + H on BJJ).
     * Used for Arkana DEFAULT_NONCE_DISCOVERY_X/Y: PedersenCommitment2FixedM1 with r=1 gives 1*G + 1*H = G + H.
     * Run: forge test --match-test test_DefaultNonceDiscoveryPoint_BJJ -vvv
     */
    function test_DefaultNonceDiscoveryPoint_BJJ() public view {
        (uint256 gX, uint256 gY) = GeneratorsFull.getG();
        (uint256 hX, uint256 hY) = GeneratorsFull.getH();
        BJJ.Point memory G = BJJ.Point(gX, gY);
        BJJ.Point memory H = BJJ.Point(hX, hY);
        BJJ.Point memory defaultPoint = BJJ.add(G, H);

        console.log("Default nonce discovery point (BJJ): G + H = PedersenCommitment2FixedM1(r=1)");
        console.log("DEFAULT_NONCE_DISCOVERY_X =");
        console.log(defaultPoint.x);
        console.log("DEFAULT_NONCE_DISCOVERY_Y =");
        console.log(defaultPoint.y);

        assertFalse(_bjjIsZero(defaultPoint), "default point must not be identity");
    }

    /**
     * @dev Test adding a point to itself (point doubling)
     */
    function test_AddPointToItself() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = GeneratorsFull.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        // Add G + G (doubling)
        BJJ.Point memory doubled = BJJ.add(G, G);

        // Assert result is not zero point
        assertFalse(_bjjIsZero(doubled), "Doubled point should not be zero");

        // Assert result is not equal to original G
        assertFalse(_bjjEq(doubled, G), "Doubled point should not equal original G");
    }

    /**
     * @dev Test creating a Pedersen commitment using getTerm
     */
    function test_CreatePedersenCommitmentWithGetTerm() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = GeneratorsFull.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        // Create a term: scalar * G
        uint256 scalar = 12345;
        BJJ.Point memory term = BJJ.getTerm(G, scalar);

        // Assert term is not zero
        assertFalse(_bjjIsZero(term), "Term should not be zero point");

        // Assert term is not equal to G
        assertFalse(_bjjEq(term, G), "Term should not equal generator G");
    }

    /**
     * @dev Test creating a Pedersen commitment with 5 values using all generators
     * Commitment = m1*G + m2*H + m3*D + m4*K + m5*J
     */
    function test_CreatePedersenCommitmentWithFiveTerms() public view {
        // Get all generators
        (uint256 gX, uint256 gY) = GeneratorsFull.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        (uint256 hX, uint256 hY) = GeneratorsFull.getH();
        BJJ.Point memory H = BJJ.Point(hX, hY);

        (uint256 dX, uint256 dY) = GeneratorsFull.getD();
        BJJ.Point memory D = BJJ.Point(dX, dY);

        (uint256 kX, uint256 kY) = GeneratorsFull.getK();
        BJJ.Point memory K = BJJ.Point(kX, kY);

        (uint256 jX, uint256 jY) = GeneratorsFull.getJ();
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
        assertFalse(_bjjIsZero(term1), "Term1 should not be zero");
        assertFalse(_bjjIsZero(term2), "Term2 should not be zero");
        assertFalse(_bjjIsZero(term3), "Term3 should not be zero");
        assertFalse(_bjjIsZero(term4), "Term4 should not be zero");
        assertFalse(_bjjIsZero(term5), "Term5 should not be zero");

        // Add all terms together to create the Pedersen commitment
        BJJ.Point memory commitment = BJJ.add(term1, term2);
        commitment = BJJ.add(commitment, term3);
        commitment = BJJ.add(commitment, term4);
        commitment = BJJ.add(commitment, term5);

        // Assert final commitment is not zero
        assertFalse(_bjjIsZero(commitment), "Final commitment should not be zero");

        // Assert commitment is not equal to any individual term
        assertFalse(_bjjEq(commitment, term1), "Commitment should not equal term1");
        assertFalse(_bjjEq(commitment, term2), "Commitment should not equal term2");
        assertFalse(_bjjEq(commitment, term3), "Commitment should not equal term3");
        assertFalse(_bjjEq(commitment, term4), "Commitment should not equal term4");
        assertFalse(_bjjEq(commitment, term5), "Commitment should not equal term5");

        // Assert commitment coordinates are valid
        assertTrue(commitment.x != 0 || commitment.y != 1, "Commitment should have valid coordinates");
    }

    /**
     * @dev Test that adding a point and its negation results in zero point
     */
    function test_AddPointAndNegation() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = GeneratorsFull.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        // Negate G
        BJJ.Point memory negG = _bjjNegate(G);

        // Add G + (-G) should equal zero point
        BJJ.Point memory result = BJJ.add(G, negG);

        // Assert result is zero point
        assertTrue(_bjjIsZero(result), "G + (-G) should equal zero point");
    }

    /**
     * @dev Test that getTerm with zero scalar returns zero point
     */
    function test_GetTermWithZeroScalar() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = GeneratorsFull.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        // Create term with zero scalar
        BJJ.Point memory term = BJJ.getTerm(G, 0);

        // Assert term is zero point
        assertTrue(_bjjIsZero(term), "0 * G should equal zero point");
    }

    /**
     * @dev Test that getTerm with scalar 1 returns the generator itself
     */
    function test_GetTermWithScalarOne() public view {
        // Get generator G
        (uint256 gX, uint256 gY) = GeneratorsFull.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        // Create term with scalar 1
        BJJ.Point memory term = BJJ.getTerm(G, 1);

        // Assert term equals G
        assertTrue(_bjjEq(term, G), "1 * G should equal G");
    }

    /**
     * @dev Test Pedersen commitment with different scalar values
     */
    function test_PedersenCommitmentWithDifferentScalars() public view {
        // Get all generators
        (uint256 gX, uint256 gY) = GeneratorsFull.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        (uint256 hX, uint256 hY) = GeneratorsFull.getH();
        BJJ.Point memory H = BJJ.Point(hX, hY);

        (uint256 dX, uint256 dY) = GeneratorsFull.getD();
        BJJ.Point memory D = BJJ.Point(dX, dY);

        (uint256 kX, uint256 kY) = GeneratorsFull.getK();
        BJJ.Point memory K = BJJ.Point(kX, kY);

        (uint256 jX, uint256 jY) = GeneratorsFull.getJ();
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
        assertFalse(_bjjIsZero(commitment1), "Commitment1 should not be zero");
        assertFalse(_bjjIsZero(commitment2), "Commitment2 should not be zero");

        // Assert commitments are different (different scalars should produce different commitments)
        assertFalse(_bjjEq(commitment1, commitment2), "Different scalars should produce different commitments");
    }
}

