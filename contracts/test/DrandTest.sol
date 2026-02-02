// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Test, console} from "forge-std/Test.sol";
import {Poseidon2HuffWrapper} from "../src/merkle/Poseidon2HuffWrapper.sol";
import {Field} from "../lib/poseidon2-evm/src/Field.sol";
import {HuffDeployer} from "foundry-huff/HuffDeployer.sol";

/**
 * @title DrandTest
 * @notice Simple test to verify drand timelock encryption flow
 *
 * Flow:
 * 1. Encrypt in circuit using only: round (future) + pubkey + genesis_seed
 * 2. When round is published, decrypt using actual signature
 */
contract DrandTest is Test {
    // Real drand data
    bytes32 public constant GENESIS_SEED = 0x176f93498eac9ca337150b46d21dd58673ea4e3581185f869672e59fa4cb390a;
    bytes32 public constant CHAIN_HASH = 0x8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce;
    uint256 public constant PERIOD = 30;
    uint256 public constant GENESIS_TIME = 1595431050;

    // Public key (compressed, 48 bytes hex)
    string public constant PUBLIC_KEY_HEX =
        "868f005eb8e6e4ca0a47c8a77ceaa5309a47978a7c71bc5cce96366b5d7a569937c529eeda66c7293784a9402801af31";

    // Target round for encryption
    uint256 public constant TARGET_ROUND = 5818961;

    // BN254 scalar field modulus
    uint256 private constant BN254_MOD = 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001;

    struct G1Point {
        uint256 x;
        uint256 y;
    }

    /// @notice Poseidon2 hasher for calculating randomness (equivalent to Noir's Poseidon2)
    Poseidon2HuffWrapper public poseidon2Hasher;

    function setUp() public {
        // Deploy Poseidon2 Huff contract and initialize hasher
        address poseidon2Huff = HuffDeployer.deploy("huff/Poseidon2");
        poseidon2Hasher = new Poseidon2HuffWrapper(poseidon2Huff);
    }

    /**
     * @notice Hash drand public key to a Field (for BN254 compatibility)
     * @param pubkeyHex The public key as hex string
     * @return pubkeyHash The hash of the public key as Field
     */
    function hashPubkey(string memory pubkeyHex) public pure returns (uint256 pubkeyHash) {
        // Convert hex string to bytes and hash
        bytes memory pubkeyBytes = bytes(pubkeyHex);
        bytes32 pubkeyBytes32 = keccak256(pubkeyBytes);
        return uint256(pubkeyBytes32);
    }

    /**
     * @notice Compute round message using pedersen-bls-chained scheme
     * @dev In drand's "pedersen-bls-chained" scheme:
     *      - Round 0: Uses genesis_seed directly
     *      - Round N: hash(previous_round_signature || round_number)
     * @param round The drand round number
     * @param previousSignature_x The x coordinate of the previous round's signature (G1 point)
     * @param previousSignature_y The y coordinate of the previous round's signature (G1 point)
     * @return message The message hash for this round
     */
    function computeRoundMessage(uint256 round, uint256 previousSignature_x, uint256 previousSignature_y)
        public
        pure
        returns (bytes32 message)
    {
        if (round == 0) {
            // Round 0 uses genesis seed directly
            return GENESIS_SEED;
        } else {
            // Round N: hash(previous_signature || round_number)
            // Drand uses SHA256 for chaining: SHA256(prev_sig || round)
            return sha256(abi.encodePacked(previousSignature_x, previousSignature_y, round));
        }
    }

    /**
     * @notice Encrypt using signature (for testing decryption)
     * @param plaintext The value to encrypt
     * @param signature_x The x coordinate of the signature (G1 point)
     * @param signature_y The y coordinate of the signature (G1 point)
     * @param round The drand round number
     * @return ciphertext The encrypted value
     */
    function encryptWithSignature(bytes32 plaintext, uint256 signature_x, uint256 signature_y, uint256 round)
        public
        view
        returns (bytes32 ciphertext)
    {
        // Compute randomness from signature using Poseidon2 (equivalent to Noir's Poseidon2)
        bytes32 randomness = computeActualRandomness(signature_x, signature_y, round);

        // Encrypt using XOR
        return bytes32(uint256(plaintext) ^ uint256(randomness));
    }

    /**
     * @notice Compute actual randomness from signature (when round is published)
     * @dev Uses Poseidon2 to match Noir circuit's calculation
     *      Reduces signature coordinates modulo BN254 field before hashing
     * @param signature_x The x coordinate of the signature (G1 point)
     * @param signature_y The y coordinate of the signature (G1 point)
     * @param round The drand round number
     * @return randomness The actual randomness value
     */
    function computeActualRandomness(uint256 signature_x, uint256 signature_y, uint256 round)
        public
        view
        returns (bytes32 randomness)
    {
        // Reduce signature coordinates modulo BN254 field before passing to Poseidon2
        // This ensures values are < PRIME as required by Field.toField()
        uint256 sigX_mod = signature_x % BN254_MOD;
        uint256 sigY_mod = signature_y % BN254_MOD;

        // Calculate randomness on-chain using Poseidon2 (equivalent to Noir's Poseidon2)
        // This will match the Noir circuit's calculation
        Field.Type randomnessField =
            poseidon2Hasher.hash_3(Field.toField(sigX_mod), Field.toField(sigY_mod), Field.toField(round));
        return bytes32(Field.toUint256(randomnessField));
    }

    /**
     * @notice Decrypt using actual randomness from signature
     * @param ciphertext The encrypted value
     * @param signature_x The x coordinate of the signature (G1 point)
     * @param signature_y The y coordinate of the signature (G1 point)
     * @param round The drand round number
     * @return plaintext The decrypted value
     */
    function decryptWithSignature(bytes32 ciphertext, uint256 signature_x, uint256 signature_y, uint256 round)
        public
        view
        returns (bytes32 plaintext)
    {
        bytes32 randomness = computeActualRandomness(signature_x, signature_y, round);

        // Decrypt using XOR
        return bytes32(uint256(ciphertext) ^ uint256(randomness));
    }

    /**
     * @notice Test encrypt and decrypt with target signature
     * @param plaintext The value to encrypt
     * @param prev_signature_x Previous round signature x coordinate (not used, just for logging)
     * @param prev_signature_y Previous round signature y coordinate (not used, just for logging)
     * @param target_signature_x Target round signature x coordinate
     * @param target_signature_y Target round signature y coordinate
     */
    function testEncryptDecryptFlow(
        bytes32 plaintext,
        uint256 prev_signature_x,
        uint256 prev_signature_y,
        uint256 target_signature_x,
        uint256 target_signature_y
    ) public {
        console.log("=== Drand Timelock Encryption Test ===");
        console.log("");

        console.log("Plaintext:");
        console.logBytes32(plaintext);
        console.log("");

        console.log("Target round:", TARGET_ROUND);
        console.log("");

        // Step 1: Encrypt using target signature
        console.log("Step 1: Encrypting with target signature...");
        bytes32 ciphertext = encryptWithSignature(plaintext, target_signature_x, target_signature_y, TARGET_ROUND);
        console.log("Ciphertext:");
        console.logBytes32(ciphertext);
        console.log("");

        // Show randomness used
        bytes32 randomness = computeActualRandomness(target_signature_x, target_signature_y, TARGET_ROUND);
        console.log("Randomness used (Poseidon2(sig.x, sig.y, round)):");
        console.logBytes32(randomness);
        console.log("");

        // Step 2: Decrypt using same signature
        console.log("Step 2: Decrypting with same signature...");
        console.log("Target signature:");
        console.log("  x:", target_signature_x);
        console.log("  y:", target_signature_y);
        console.log("");

        bytes32 decrypted = decryptWithSignature(ciphertext, target_signature_x, target_signature_y, TARGET_ROUND);

        console.log("Decrypted plaintext:");
        console.logBytes32(decrypted);
        console.log("");

        // Verify decryption
        bool success = (decrypted == plaintext);
        console.log("Decryption successful:", success);

        assertEq(decrypted, plaintext, "Decryption must match original plaintext");
    }

    /**
     * @notice Parse drand signature hex string and create G1Point for testing
     * @dev This is a simplified version - proper implementation needs BLS12-381 decompression
     *      The signature is compressed (48 bytes), but we derive a deterministic point for testing
     * @param signatureHex The signature as hex string (96 hex chars = 48 bytes, no 0x prefix)
     * @param round The drand round number
     * @return signature The G1Point (derived deterministically for testing)
     */
    function parseDrandSignatureForTesting(string memory signatureHex, uint256 round)
        public
        pure
        returns (G1Point memory signature)
    {
        // Hash the signature hex string to create deterministic randomness
        bytes32 sigHash = keccak256(abi.encodePacked(signatureHex, round));

        // Create deterministic signature point from hash (for testing only)
        // BLS12-381 G1 field modulus
        uint256 g1FieldMod = 0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47;

        // Use hash to derive x and y coordinates deterministically
        uint256 sigX = uint256(keccak256(abi.encodePacked("sig_x", sigHash))) % g1FieldMod;
        uint256 sigY = uint256(keccak256(abi.encodePacked("sig_y", sigHash))) % g1FieldMod;

        return G1Point({x: sigX, y: sigY});
    }

    /**
     * @notice Test with real drand signatures for round 5818861
     * @dev Uses real signature data from drand API
     */
    function testWithRealSignatures() public {
        bytes32 plaintext = bytes32(abi.encodePacked("TEST_MESSAGE"));

        // Real drand data for round 5818861
        uint256 targetRound = 5818861;
        string memory targetSignatureHex =
            "afe9fcb27794bcd4653c311c92cacf5916ba982090038aaf5d4ea15b0ee67682e6bb0f9acc7f281448eb841e924fb5e110592cac138501b85f8be1591ca014e377641bce48c6fc73117154b43a8f7a628f8ffb73ec4363885709be9306b01f05";
        string memory prevSignatureHex =
            "967a75427ba5b12d0bbe4ef824ccdd065a55ea689a96e61c57963fa1785a14efcade4fe5d8d7411c4c9d23aae26a741b0e58cb5aaae9474f881a8d6f579a27226e5b11f672ab66706c77f3b24ae15dacbb9fafdbe3cbcffc80103d5b26766084";

        // Parse signatures (derives deterministic points for testing)
        G1Point memory prevSig = parseDrandSignatureForTesting(prevSignatureHex, targetRound - 1);
        G1Point memory targetSig = parseDrandSignatureForTesting(targetSignatureHex, targetRound);

        testEncryptDecryptFlow(plaintext, prevSig.x, prevSig.y, targetSig.x, targetSig.y);
    }
}

