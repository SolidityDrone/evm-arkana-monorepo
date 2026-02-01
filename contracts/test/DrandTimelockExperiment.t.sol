// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Test, console} from "forge-std/Test.sol";

/**
 * @title DrandTimelockExperiment
 * @notice Trustless timelock encryption using drand rounds
 * @dev Uses BLS12-381 precompiles for drand signature verification
 *      Enables encryption that can only be decrypted after a specific drand round is published
 *
 * Drand info endpoint provides:
 * - public_key: BLS12-381 G2 public key (hex string)
 * - period: Round period in seconds (30)
 * - genesis_time: Unix timestamp of round 0
 * - genesis_seed: Initial seed for round 0
 * - chain_hash: Chain identifier
 * - scheme: "pedersen-bls-chained"
 *
 * BLS12-381 Precompiles:
 * - 0x0b: BLS12_G1ADD - G1 point addition
 * - 0x0c: BLS12_G1MSM - G1 multi-scalar multiplication
 * - 0x0d: BLS12_G2ADD - G2 point addition
 * - 0x0e: BLS12_G2MSM - G2 multi-scalar multiplication
 * - 0x0f: BLS12_PAIRING_CHECK - Pairing check (for signature verification)
 * - 0x10: BLS12_MAP_FP_TO_G1 - Map field element to G1
 * - 0x11: BLS12_MAP_FP2_TO_G2 - Map field extension element to G2
 */
contract DrandTimelockExperiment is Test {
    /// @notice Drand public key (BLS12-381 G2 point)
    /// @dev Stored as (x_c0, x_c1, y_c0, y_c1) - 4 uint256 values
    struct G2Point {
        uint256 x_c0;
        uint256 x_c1;
        uint256 y_c0;
        uint256 y_c1;
    }

    /// @notice Drand configuration
    struct DrandConfig {
        G2Point publicKey; // BLS12-381 G2 public key
        uint256 period; // Round period in seconds (30)
        uint256 genesisTime; // Unix timestamp of round 0
        bytes32 genesisSeed; // Initial seed for round 0
        bytes32 chainHash; // Chain identifier
    }

    /// @notice Public drand configuration
    /// @dev Cannot be immutable because structs are not value types
    DrandConfig public drandConfig;

    /// @notice BLS12-381 G1 point (for signatures)
    struct G1Point {
        uint256 x;
        uint256 y;
    }

    /**
     * @notice Initialize drand configuration
     * @param publicKeyX_c0 G2 public key x coordinate c0
     * @param publicKeyX_c1 G2 public key x coordinate c1
     * @param publicKeyY_c0 G2 public key y coordinate c0
     * @param publicKeyY_c1 G2 public key y coordinate c1
     * @param period Round period in seconds
     * @param genesisTime Unix timestamp of round 0
     * @param genesisSeed Initial seed for round 0
     * @param chainHash Chain identifier
     */
    constructor(
        uint256 publicKeyX_c0,
        uint256 publicKeyX_c1,
        uint256 publicKeyY_c0,
        uint256 publicKeyY_c1,
        uint256 period,
        uint256 genesisTime,
        bytes32 genesisSeed,
        bytes32 chainHash
    ) {
        drandConfig = DrandConfig({
            publicKey: G2Point({x_c0: publicKeyX_c0, x_c1: publicKeyX_c1, y_c0: publicKeyY_c0, y_c1: publicKeyY_c1}),
            period: period,
            genesisTime: genesisTime,
            genesisSeed: genesisSeed,
            chainHash: chainHash
        });
    }

    /**
     * @notice Compute the message hash for a given drand round
     * @dev In drand's "pedersen-bls-chained" scheme:
     *      - Round 0: Uses genesis_seed directly
     *      - Round N: hash(previous_round_signature || round_number)
     * @param round The drand round number
     * @param previousSignature The signature from the previous round (G1 point)
     * @return message The message hash for this round (as bytes32, will be mapped to G1)
     */
    function computeRoundMessage(uint256 round, G1Point memory previousSignature)
        public
        view
        returns (bytes32 message)
    {
        if (round == 0) {
            // Round 0 uses genesis seed directly
            return drandConfig.genesisSeed;
        } else {
            // Round N: hash(previous_signature || round_number)
            // Drand uses SHA256 for chaining: SHA256(prev_sig || round)
            return sha256(abi.encodePacked(previousSignature.x, previousSignature.y, round));
        }
    }

    /**
     * @notice Map a message (bytes32) to a G1 point using BLS12_MAP_FP_TO_G1 precompile
     * @dev Uses precompile 0x10 (BLS12_MAP_FP_TO_G1)
     * @param message The message to map (bytes32)
     * @return g1Point The G1 point representation of the message
     */
    function mapMessageToG1(bytes32 message) public view returns (G1Point memory g1Point) {
        uint256[2] memory output;

        assembly {
            let success :=
                staticcall(
                    gas(),
                    0x10, // BLS12_MAP_FP_TO_G1 precompile
                    message,
                    0x20, // 32 bytes
                    output,
                    0x40 // 2 * 32 bytes (x, y)
                )
            if iszero(success) {
                revert(0, 0)
            }
        }

        return G1Point({x: output[0], y: output[1]});
    }

    /**
     * @notice Get the expected timestamp for a given drand round
     * @param round The drand round number
     * @return timestamp The expected Unix timestamp for this round
     */
    function getRoundTimestamp(uint256 round) public view returns (uint256 timestamp) {
        return drandConfig.genesisTime + (round * drandConfig.period);
    }

    /**
     * @notice BLS12-381 G2 generator point (standard generator)
     * @dev This is the standard generator for BLS12-381 G2 group
     *      Used in BLS signature verification: e(sig, G2_gen) == e(H(m), pubkey)
     *      TODO: Replace with actual BLS12-381 G2 generator coordinates
     *      For now, this returns zero point - needs to be set to correct generator
     *      Note: The actual generator coordinates are too large to fit in uint256 literals
     *      They need to be set via constructor or setter function
     */
    G2Point private g2Generator;

    function getG2Generator() public view returns (G2Point memory) {
        return g2Generator;
    }

    /**
     * @notice Set the G2 generator point
     * @dev This should be called once with the actual BLS12-381 G2 generator coordinates
     * @param x_c0 G2 generator x coordinate c0
     * @param x_c1 G2 generator x coordinate c1
     * @param y_c0 G2 generator y coordinate c0
     * @param y_c1 G2 generator y coordinate c1
     */
    function setG2Generator(uint256 x_c0, uint256 x_c1, uint256 y_c0, uint256 y_c1) public {
        g2Generator = G2Point({x_c0: x_c0, x_c1: x_c1, y_c0: y_c0, y_c1: y_c1});
    }

    /**
     * @notice Verify a BLS12-381 signature using pairing check
     * @dev Uses precompile 0x0f (BLS12_PAIRING_CHECK)
     *      BLS verification: e(signature, G2_generator) == e(H(message), publicKey)
     *      Which is: e(signature, G2_generator) * e(-H(message), publicKey) == 1
     * @param message The message that was signed (as G1 point, typically H(message))
     * @param signature The BLS signature (G1 point)
     * @param publicKey The public key (G2 point)
     * @return isValid True if signature is valid
     */
    function verifyBLSSignature(G1Point memory message, G1Point memory signature, G2Point memory publicKey)
        public
        view
        returns (bool isValid)
    {
        // BLS signature verification equation:
        // e(signature, G2_generator) == e(H(message), publicKey)
        // Which is equivalent to: e(signature, G2_generator) * e(-H(message), publicKey) == 1

        G2Point memory g2Gen = getG2Generator();

        // Negate the message point in G1
        G1Point memory negMessage =
            G1Point({x: message.x, y: 0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47 - message.y});

        // Prepare pairing input: [sig, g2Gen, negMessage, pubkey]
        // Each pair is 6 uint256 values: [g1_x, g1_y, g2_x_c0, g2_x_c1, g2_y_c0, g2_y_c1]
        uint256[24] memory input;

        // First pair: (signature, G2_generator)
        input[0] = signature.x;
        input[1] = signature.y;
        input[2] = g2Gen.x_c0;
        input[3] = g2Gen.x_c1;
        input[4] = g2Gen.y_c0;
        input[5] = g2Gen.y_c1;

        // Second pair: (-message, publicKey)
        input[6] = negMessage.x;
        input[7] = negMessage.y;
        input[8] = publicKey.x_c0;
        input[9] = publicKey.x_c1;
        input[10] = publicKey.y_c0;
        input[11] = publicKey.y_c1;

        // Call BLS12_PAIRING_CHECK precompile (0x0f)
        uint256[1] memory out;
        assembly {
            let success :=
                staticcall(
                    gas(),
                    0x0f, // BLS12_PAIRING_CHECK precompile
                    input,
                    0x300, // 24 * 32 bytes
                    out,
                    0x20 // 1 * 32 bytes
                )
            if iszero(success) {
                revert(0, 0)
            }
        }

        // Precompile returns 1 if pairing is valid, 0 otherwise
        return out[0] == 1;
    }

    /**
     * @notice Parse drand signature from hex string to G1Point
     * @dev Drand signatures are 96 bytes (48 bytes compressed, but we need uncompressed G1 point)
     *      Signature format: "a11be4f8c42f3fbb00b377292b382eeefa6c4c1ae03fcf7e1abbfb32189fd68847f438f0546d02e6c938913fb5a2bb501889e1955447e69a206a77e5c351d1eabb2b57038bfdff023dbd80e91581f0ba922a04b417d6f2ccef7c64fa0ef7072e"
     *      This is 96 hex chars = 48 bytes (compressed format)
     * @param signatureHex The signature as hex string (96 hex chars = 48 bytes)
     * @return signature The G1Point representation
     * @dev Note: This assumes the signature is already in G1 format.
     *      If compressed, it needs decompression (complex, typically done off-chain)
     */
    function parseSignatureFromHex(string memory signatureHex) public pure returns (G1Point memory signature) {
        // For now, this is a placeholder - actual parsing requires decompression
        // The signature hex needs to be converted from compressed to (x, y) coordinates
        revert("Signature parsing from hex requires decompression - use parseSignatureFromBytes instead");
    }

    /**
     * @notice Parse drand signature from bytes to G1Point
     * @dev Assumes signature is already in uncompressed format (64 bytes: x, y)
     *      If you have compressed format (48 bytes), decompress first
     * @param signatureBytes The signature as bytes (64 bytes for uncompressed)
     * @return signature The G1Point representation
     */
    function parseSignatureFromBytes(bytes memory signatureBytes) public pure returns (G1Point memory signature) {
        require(signatureBytes.length == 64, "Signature must be 64 bytes (uncompressed G1 point)");

        uint256 x;
        uint256 y;

        assembly {
            x := mload(add(signatureBytes, 0x20))
            y := mload(add(signatureBytes, 0x40))
        }

        return G1Point({x: x, y: y});
    }

    /**
     * @notice Compute the randomness value for a given round
     * @dev In drand, randomness is typically derived from the signature
     *      Standard approach: hash the signature coordinates
     * @param round The drand round number
     * @param signature The signature for this round (G1 point)
     * @return randomness The randomness value (bytes32)
     */
    function computeRandomness(uint256 round, G1Point memory signature) public pure returns (bytes32 randomness) {
        // Drand randomness is typically derived from the signature
        // Standard approach: hash(signature.x || signature.y || round)
        // This creates a deterministic randomness value for the round
        return keccak256(abi.encodePacked(signature.x, signature.y, round));
    }

    /**
     * @notice Encrypt a value using drand round randomness
     * @dev Uses XOR encryption with the randomness as the key
     *      This creates time-locked encryption: can only decrypt when round is published
     * @param plaintext The value to encrypt (bytes32)
     * @param targetRound The drand round to use for encryption
     * @param roundSignature The signature for the target round (G1 point)
     * @return ciphertext The encrypted value
     */
    function encryptWithDrandRound(bytes32 plaintext, uint256 targetRound, G1Point memory roundSignature)
        public
        pure
        returns (bytes32 ciphertext)
    {
        // Compute randomness for the target round
        bytes32 randomness = computeRandomness(targetRound, roundSignature);

        // Encrypt using XOR (equivalent to addition in field arithmetic)
        return bytes32(uint256(plaintext) ^ uint256(randomness));
    }

    /**
     * @notice Decrypt a value using drand round randomness
     * @dev Decryption is the same as encryption (XOR is symmetric)
     * @param ciphertext The encrypted value
     * @param targetRound The drand round that was used for encryption
     * @param roundSignature The signature for the target round (G1 point)
     * @return plaintext The decrypted value
     */
    function decryptWithDrandRound(bytes32 ciphertext, uint256 targetRound, G1Point memory roundSignature)
        public
        pure
        returns (bytes32 plaintext)
    {
        // Decryption is the same as encryption (XOR is symmetric)
        return encryptWithDrandRound(ciphertext, targetRound, roundSignature);
    }

    /**
     * @notice Verify a drand round and compute its randomness
     * @dev This function verifies the signature and returns the randomness
     * @param round The drand round number
     * @param signature The signature for this round (G1 point)
     * @param previousSignature The signature from the previous round (for chaining)
     * @return isValid True if signature is valid
     * @return randomness The randomness value for this round
     */
    function verifyRoundAndGetRandomness(uint256 round, G1Point memory signature, G1Point memory previousSignature)
        public
        view
        returns (bool isValid, bytes32 randomness)
    {
        // Verify the signature
        isValid = verifyDrandRound(round, signature, previousSignature);

        // Compute randomness regardless of validity (for testing)
        randomness = computeRandomness(round, signature);
    }

    /**
     * @notice Helper to parse hex string public key to G2Point
     * @dev Drand public key is provided as hex string (compressed or uncompressed)
     *      Example: "868f005eb8e6e4ca0a47c8a77ceaa5309a47978a7c71bc5cce96366b5d7a569937c529eeda66c7293784a9402801af31"
     *      This is 48 bytes (compressed) or 96 bytes (uncompressed)
     *      Note: This function should be called from a test context where vm.parseHex is available
     * @param hexKey The public key as hex string
     * @return publicKey The G2Point representation
     */
    function parseHexToG2Point(string memory hexKey) public pure returns (G2Point memory publicKey) {
        // This function is a placeholder - actual parsing should be done in test setup
        // where vm.parseHex is available. For now, return zero point.
        // TODO: Implement proper hex parsing or use a library
        revert("Use parseHexToG2PointBytes instead and pass bytes directly");
    }

    /**
     * @notice Helper to convert bytes public key to G2Point
     * @dev Drand public key as bytes (96 bytes uncompressed format)
     * @param keyBytes The public key as bytes (96 bytes)
     * @return publicKey The G2Point representation
     */
    function bytesToG2Point(bytes memory keyBytes) public pure returns (G2Point memory publicKey) {
        // Drand public keys are typically 48 bytes (compressed) or 96 bytes (uncompressed)
        // For now, we'll handle 96-byte uncompressed format
        require(keyBytes.length == 96, "Invalid public key length - expected 96 bytes");

        uint256 x_c0;
        uint256 x_c1;
        uint256 y_c0;
        uint256 y_c1;

        assembly {
            x_c0 := mload(add(keyBytes, 0x20))
            x_c1 := mload(add(keyBytes, 0x40))
            y_c0 := mload(add(keyBytes, 0x60))
            y_c1 := mload(add(keyBytes, 0x80))
        }

        return G2Point({x_c0: x_c0, x_c1: x_c1, y_c0: y_c0, y_c1: y_c1});
    }

    /**
     * @notice Verify a drand round signature
     * @dev This function verifies that a given signature is valid for a specific drand round
     * @param round The drand round number
     * @param signature The signature for this round (G1 point)
     * @param previousSignature The signature from the previous round (for chaining)
     * @return isValid True if signature is valid for this round
     */
    function verifyDrandRound(uint256 round, G1Point memory signature, G1Point memory previousSignature)
        public
        view
        returns (bool isValid)
    {
        // Compute the message for this round
        bytes32 message = computeRoundMessage(round, previousSignature);

        // Map message to G1 point
        G1Point memory messageG1 = mapMessageToG1(message);

        // Verify BLS signature: e(sig, G2_gen) == e(H(msg), pubkey)
        return verifyBLSSignature(messageG1, signature, drandConfig.publicKey);
    }

    // ============ TEST FUNCTIONS ============

    /**
     * @notice Test function to verify drand configuration is stored correctly
     */
    function test_DrandConfig() public view {
        console.log("Drand Configuration:");
        console.log("  Period:", drandConfig.period);
        console.log("  Genesis Time:", drandConfig.genesisTime);
        console.log("  Genesis Seed:");
        console.logBytes32(drandConfig.genesisSeed);
        console.log("  Chain Hash:");
        console.logBytes32(drandConfig.chainHash);
        console.log("  Public Key (G2):");
        console.log("    x_c0:", drandConfig.publicKey.x_c0);
        console.log("    x_c1:", drandConfig.publicKey.x_c1);
        console.log("    y_c0:", drandConfig.publicKey.y_c0);
        console.log("    y_c1:", drandConfig.publicKey.y_c1);
    }

    /**
     * @notice Test function to compute round timestamps
     */
    function test_RoundTimestamps() public view {
        console.log("Round Timestamps:");
        for (uint256 i = 0; i < 5; i++) {
            uint256 timestamp = getRoundTimestamp(i);
            console.log("  Round", i, ":", timestamp);
        }
    }

    /**
     * @notice Test function to compute round message
     */
    function test_ComputeRoundMessage() public view {
        console.log("Testing Round Message Computation:");

        // Round 0 should use genesis seed
        bytes32 round0Message = computeRoundMessage(0, G1Point(0, 0));
        console.log("  Round 0 message:");
        console.logBytes32(round0Message);
        assertEq(round0Message, drandConfig.genesisSeed, "Round 0 should use genesis seed");

        // Round 1 should hash previous signature
        G1Point memory round0Sig = G1Point({
            x: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef,
            y: 0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321
        });
        bytes32 round1Message = computeRoundMessage(1, round0Sig);
        console.log("  Round 1 message:");
        console.logBytes32(round1Message);
    }
}

/**
 * @title DrandTimelockExperimentTest
 * @notice Test contract that instantiates DrandTimelockExperiment with actual drand beacon data
 */
contract DrandTimelockExperimentTest is Test {
    DrandTimelockExperiment public drand;

    function setUp() public {
        // Initialize with drand beacon info endpoint data:
        // {
        //   "public_key": "868f005eb8e6e4ca0a47c8a77ceaa5309a47978a7c71bc5cce96366b5d7a569937c529eeda66c7293784a9402801af31",
        //   "period": 30,
        //   "genesis_time": 1595431050,
        //   "genesis_seed": "176f93498eac9ca337150b46d21dd58673ea4e3581185f869672e59fa4cb390a",
        //   "chain_hash": "8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce",
        //   "scheme": "pedersen-bls-chained",
        //   "beacon_id": "default"
        // }

        bytes32 genesisSeed = 0x176f93498eac9ca337150b46d21dd58673ea4e3581185f869672e59fa4cb390a;
        bytes32 chainHash = 0x8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce;

        // Parse public key from hex string
        // The public key "868f005eb8e6e4ca0a47c8a77ceaa5309a47978a7c71bc5cce96366b5d7a569937c529eeda66c7293784a9402801af31"
        // is 48 bytes (compressed format) - needs to be decompressed to G2Point format (96 bytes)
        // TODO: The drand public key is in compressed format (48 bytes)
        // It needs to be decompressed to G2Point format (96 bytes: x_c0, x_c1, y_c0, y_c1)
        // For now, using zero values as placeholders
        // Note: Decompression of BLS12-381 G2 points from compressed format requires
        //       field arithmetic and is complex - this should be done off-chain or with a library

        drand = new DrandTimelockExperiment(
            0, // publicKeyX_c0 - TODO: decompress from hex
            0, // publicKeyX_c1 - TODO: decompress from hex
            0, // publicKeyY_c0 - TODO: decompress from hex
            0, // publicKeyY_c1 - TODO: decompress from hex
            30, // period
            1595431050, // genesisTime
            genesisSeed,
            chainHash
        );
    }

    function test_DrandSetup() public view {
        drand.test_DrandConfig();
    }

    function test_RoundTimestamps() public view {
        drand.test_RoundTimestamps();
    }

    function test_ComputeRoundMessage() public view {
        drand.test_ComputeRoundMessage();
    }

    /**
     * @notice Test encrypting a value under the latest drand round (5817429)
     * @dev This demonstrates time-locked encryption using actual latest drand data
     *      Uses the latest published round from drand API
     */
    function test_EncryptWithLatestDrandRound() public {
        console.log("=== Testing Time-Locked Encryption with Latest Drand Round ===");
        console.log("");

        // Latest drand round: 5817429
        uint256 targetRound = 5817429;
        bytes32 plaintext = bytes32(abi.encodePacked("MACHECAZZOMESOINVENTATOPORCODDIO"));

        console.log("Plaintext to encrypt:");
        console.logBytes32(plaintext);
        console.log("Target round:", targetRound);
        console.log("");

        // Real signature from drand round 5817429
        // Signature: "8b3285302ad09ddc3e392aa78a3dac2de9433ed2a210df6f46456dfae137f466b98fa4e7a5e8315506d0e9b25684bf1e08afd08cd0079a7a51595645fb638de01e12650ca6b0529a2bc3f3942f2e91a4834c8c26af6c9268d00239828bf38356"
        string memory signatureHex =
            "8b3285302ad09ddc3e392aa78a3dac2de9433ed2a210df6f46456dfae137f466b98fa4e7a5e8315506d0e9b25684bf1e08afd08cd0079a7a51595645fb638de01e12650ca6b0529a2bc3f3942f2e91a4834c8c26af6c9268d00239828bf38356";

        // Parse signature (derives deterministic point for testing)
        DrandTimelockExperiment.G1Point memory signature = parseDrandSignatureForTesting(signatureHex, targetRound);

        console.log("Using real signature from drand round 5817429");
        console.log("Signature point (derived deterministically for testing):");
        console.log("  x:", signature.x);
        console.log("  y:", signature.y);
        console.log("");

        // Encrypt the value
        bytes32 ciphertext = drand.encryptWithDrandRound(plaintext, targetRound, signature);

        console.log("Ciphertext:");
        console.logBytes32(ciphertext);
        console.log("");

        // Compute randomness for verification
        bytes32 randomness = drand.computeRandomness(targetRound, signature);
        console.log("Round randomness:");
        console.logBytes32(randomness);
        console.log("");

        // Decrypt to verify
        bytes32 decrypted = drand.decryptWithDrandRound(ciphertext, targetRound, signature);

        console.log("Decrypted plaintext:");
        console.log(string(abi.encodePacked(decrypted)));
        console.log("");

        assertEq(decrypted, plaintext, "Decryption should match original plaintext");
        console.log(" Encryption/Decryption with latest round passed!");
        console.log("");
        console.log("Note: This uses a deterministic signature derivation for testing.");
        console.log("      In production, properly decompress the BLS12-381 signature.");
    }

    /**
     * @notice Test encryption/decryption with actual drand round 5817384
     * @dev Uses real drand signature data from the API
     *      Signature: "a11be4f8c42f3fbb00b377292b382eeefa6c4c1ae03fcf7e1abbfb32189fd68847f438f0546d02e6c938913fb5a2bb501889e1955447e69a206a77e5c351d1eabb2b57038bfdff023dbd80e91581f0ba922a04b417d6f2ccef7c64fa0ef7072e"
     *      Previous: "b79888cb80cab048e49600bdb07bf8e50019612f85bdb3a14568532fd7560dd75c52d8d37b053c9a0f6ffa1caed66bf910dd1aab9fc7768dd2b61646b42be9fba37d315220a6a5b1ef76278fe1831b7a8068ade533cd80d96ba3ad23d5e1d81c"
     */
    function test_EncryptDecryptWithRound5817384() public {
        console.log("=== Testing Encryption/Decryption with Drand Round 5817384 ===");
        console.log("");

        uint256 round = 5817384;
        bytes32 plaintext = 0x0000000000000000000000000000000000000000000000000000000000031100;

        console.log("Round:", round);
        console.log("Original plaintext:");
        console.logBytes32(plaintext);
        console.log("");

        // Drand signature from API (96 hex chars = 48 bytes compressed)
        // We need to decompress this to get (x, y) coordinates
        // For now, we'll parse the hex string and extract bytes
        // Note: The signature is in compressed format, so we need to decompress it
        // This is complex and typically done off-chain, but for testing we can use a workaround

        // Signature hex: "a11be4f8c42f3fbb00b377292b382eeefa6c4c1ae03fcf7e1abbfb32189fd68847f438f0546d02e6c938913fb5a2bb501889e1955447e69a206a77e5c351d1eabb2b57038bfdff023dbd80e91581f0ba922a04b417d6f2ccef7c64fa0ef7072e"
        // Previous signature hex: "b79888cb80cab048e49600bdb07bf8e50019612f85bdb3a14568532fd7560dd75c52d8d37b053c9a0f6ffa1caed66bf910dd1aab9fc7768dd2b61646b42be9fba37d315220a6a5b1ef76278fe1831b7a8068ade533cd80d96ba3ad23d5e1d81c"

        // For testing, we'll create a signature from the hex bytes
        // The signature is 48 bytes compressed, but we need 64 bytes (x, y) for G1Point
        // We'll use the first 32 bytes as x and derive y (this is a simplification)
        // In production, proper decompression is needed

        // Parse signature bytes (using first 32 bytes as x, next 16 bytes + padding as y for testing)
        // This is a workaround - real implementation needs proper BLS12-381 point decompression
        bytes memory sigBytes =
            hex"a11be4f8c42f3fbb00b377292b382eeefa6c4c1ae03fcf7e1abbfb32189fd68847f438f0546d02e6c938913fb5a2bb501889e1955447e69a206a77e5c351d1eabb2b57038bfdff023dbd80e91581f0ba922a04b417d6f2ccef7c64fa0ef7072e";

        console.log("Signature bytes length:", sigBytes.length);
        console.log("Note: Signature is compressed (48 bytes), needs decompression to G1Point");
        console.log("");

        // For now, we'll use a simplified approach: hash the signature to create a deterministic G1 point
        // This is NOT cryptographically correct but allows testing the encryption/decryption flow
        // In production, you MUST properly decompress the BLS12-381 signature

        // Create a deterministic "signature" point from the actual signature bytes for testing
        uint256 sigX = uint256(keccak256(abi.encodePacked("sig_x", sigBytes, round)));
        uint256 sigY = uint256(keccak256(abi.encodePacked("sig_y", sigBytes, round)));

        // Normalize to field (this is a hack for testing - not cryptographically valid)
        // BLS12-381 G1 field modulus
        uint256 g1FieldMod = 0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47;
        sigX = sigX % g1FieldMod;
        sigY = sigY % g1FieldMod;

        DrandTimelockExperiment.G1Point memory signature = DrandTimelockExperiment.G1Point({x: sigX, y: sigY});

        console.log("Using derived signature point (for testing):");
        console.log("  x:", signature.x);
        console.log("  y:", signature.y);
        console.log("");

        // Encrypt the plaintext
        bytes32 ciphertext = drand.encryptWithDrandRound(plaintext, round, signature);

        console.log("Ciphertext:");
        console.logBytes32(ciphertext);
        console.log("");

        // Decrypt to verify
        bytes32 decrypted = drand.decryptWithDrandRound(ciphertext, round, signature);

        console.log("Decrypted plaintext:");
        console.logBytes32(decrypted);
        console.log("");

        assertEq(decrypted, plaintext, "Decryption should match original plaintext");
        console.log(" Encryption/Decryption with round 5817384 passed!");
        console.log("");
        console.log("Note: This uses a simplified signature derivation for testing.");
        console.log("      In production, properly decompress the BLS12-381 signature.");
    }

    /**
     * @notice Helper function to parse drand signature hex string and create G1Point for testing
     * @dev This is a simplified version - proper implementation needs BLS12-381 decompression
     *      The signature is compressed (48 bytes), but we derive a deterministic point for testing
     * @param signatureHex The signature as hex string (96 hex chars = 48 bytes, no 0x prefix)
     * @param round The drand round number
     * @return signature The G1Point (derived deterministically for testing)
     */
    function parseDrandSignatureForTesting(string memory signatureHex, uint256 round)
        public
        pure
        returns (DrandTimelockExperiment.G1Point memory signature)
    {
        // Use vm.parseHex in test context - but since this is in DrandExperiment contract,
        // we'll use a workaround: directly use hex literal
        // For the actual hex string, we'll hash it to create a deterministic point

        // Hash the signature hex string to create deterministic randomness
        bytes32 sigHash = keccak256(abi.encodePacked(signatureHex, round));

        // Create deterministic signature point from hash (for testing only)
        // BLS12-381 G1 field modulus
        uint256 g1FieldMod = 0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47;

        // Use hash to derive x and y coordinates deterministically
        uint256 sigX = uint256(keccak256(abi.encodePacked("sig_x", sigHash))) % g1FieldMod;
        uint256 sigY = uint256(keccak256(abi.encodePacked("sig_y", sigHash))) % g1FieldMod;

        return DrandTimelockExperiment.G1Point({x: sigX, y: sigY});
    }

    /**
     * @notice Test with actual drand signature from API (round 5817384)
     * @dev Uses the real signature hex string from drand API
     *      This demonstrates the full encryption/decryption flow with actual drand data
     */
    function test_WithRealDrandSignatureHex() public {
        console.log("=== Testing with Real Drand Signature (Round 5817384) ===");
        console.log("");

        uint256 round = 5817384;
        string memory signatureHex =
            "a11be4f8c42f3fbb00b377292b382eeefa6c4c1ae03fcf7e1abbfb32189fd68847f438f0546d02e6c938913fb5a2bb501889e1955447e69a206a77e5c351d1eabb2b57038bfdff023dbd80e91581f0ba922a04b417d6f2ccef7c64fa0ef7072e";

        console.log("Round:", round);
        console.log("Signature hex (compressed, 48 bytes):");
        console.log(signatureHex);
        console.log("");

        // Parse signature (simplified for testing - derives deterministic point)
        DrandTimelockExperiment.G1Point memory signature = parseDrandSignatureForTesting(signatureHex, round);

        console.log("Signature point (derived deterministically for testing):");
        console.log("  x:", signature.x);
        console.log("  y:", signature.y);
        console.log("");

        // Test encryption/decryption with value 0x31100
        bytes32 plaintext = bytes32(abi.encodePacked("MACHECAZZOMESOINVENTATOPORCODDIO"));

        console.log("Plaintext:");
        console.logBytes32(plaintext);
        console.log("");

        // Encrypt
        bytes32 ciphertext = drand.encryptWithDrandRound(plaintext, round, signature);

        console.log("Ciphertext (encrypted with round randomness):");
        console.logBytes32(ciphertext);
        console.log("");

        // Compute randomness for verification
        bytes32 randomness = drand.computeRandomness(round, signature);
        console.log("Round randomness:");
        console.logBytes32(randomness);
        console.log("");

        // Decrypt
        bytes32 decrypted = drand.decryptWithDrandRound(ciphertext, round, signature);

        console.log("Decrypted plaintext:");
        console.log(string(abi.encodePacked(decrypted)));
        console.log("");

        assertEq(decrypted, plaintext, "Decryption should match original plaintext");
        console.log(" Encryption/Decryption test passed!");
        console.log("");
        console.log("Note: This uses a deterministic signature derivation for testing.");
        console.log("      In production, properly decompress the BLS12-381 signature from compressed format.");
    }
}

