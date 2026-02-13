// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Test} from "forge-std/Test.sol";

/**
 * @title VerifierProofsTest
 * @notice Verifies each circuit's proof with hardcoded values from proofs_for_solidity.json
 * @dev Values are directly embedded - no JSON parsing required
 */

import {Groth16Verifier as VerifierEntry} from "../src/Verifiers/VerifierEntry.sol";
import {Groth16Verifier as VerifierDeposit} from "../src/Verifiers/VerifierDeposit.sol";
import {Groth16Verifier as VerifierWithdraw} from "../src/Verifiers/VerifierWithdraw.sol";
import {Groth16Verifier as VerifierSend} from "../src/Verifiers/VerifierSend.sol";
import {Groth16Verifier as VerifierAbsorbSend} from "../src/Verifiers/VerifierAbsorbSend.sol";
import {Groth16Verifier as VerifierAbsorbWithdraw} from "../src/Verifiers/VerifierAbsorbWithdraw.sol";

contract VerifierProofsTest is Test {
    VerifierEntry public entryVerifier;
    VerifierDeposit public depositVerifier;
    VerifierWithdraw public withdrawVerifier;
    VerifierSend public sendVerifier;
    VerifierAbsorbSend public absorbSendVerifier;
    VerifierAbsorbWithdraw public absorbWithdrawVerifier;

    function setUp() public {
        entryVerifier = new VerifierEntry();
        depositVerifier = new VerifierDeposit();
        withdrawVerifier = new VerifierWithdraw();
        sendVerifier = new VerifierSend();
        absorbSendVerifier = new VerifierAbsorbSend();
        absorbWithdrawVerifier = new VerifierAbsorbWithdraw();
    }

    // ============================================
    // ENTRY VERIFIER TEST
    // ============================================
    function test_EntryProof() public view {
        uint256[2] memory pA = [
            0x0c40de02481465562b0fa36045ceb675eeb5189198f887b864015ca7af92c5d7,
            0x1ab4856155a7f31136d98a0902ea9b02cb8b1ca7ce64d5955dbfff903f564dbe
        ];
        
        uint256[2][2] memory pB = [
            [
                0x2234c93f7370e84c7767b22b18e6bd877705274bf6fe215c3321916a975bf405,
                0x048f4592258b7c3117740920573e2f37e13f08033bb0e27af10dd3de8fc5950f
            ],
            [
                0x16c1cfeb269779e7c48a09fe3d10a7e7916cd69d9ef1565413f45d25436e4202,
                0x0323acb6ae6d1c51702b1aa5b067e01027dc1e80ab303bc9f71a02d9c144f2e6
            ]
        ];
        
        uint256[2] memory pC = [
            0x248778c218c66aac4b6bdbf44eae9decf02e508c9563fd1e0a14103b40c1e56a,
            0x26fb93413016ab333d1601707d6fce77a6ed2e34dffff9ace6ab2afc49b3a7d1
        ];
        
        uint256[7] memory pubSignals = [
            0x1ce91513333943f99954b387f3a81c4a90f2ec6d21cc32611dec9e361de26018,
            0x1d36412138779faacbf3bb919b91ce8051767292e89d35ed0d3062c1c538fa62,
            0x2a3a6bf91180c39eb2f4bb6cccf5fc89a30c885404fada4752eff9c66b0c3932,
            0x221efec6daba1fce0dcd0acb05983ff5239f6e1d95ef8dd75297bcf8e690e775,
            0x0714347f87c93717763dfe95eedb8e4025258e2d0bcc50dedc94d6d3a63745c0,
            0x0000000000000000000000000000000000000000000000000000000000000002,
            0x0000000000000000000000000000000000000000000000000000000000000001
        ];
        
        bool valid = entryVerifier.verifyProof(pA, pB, pC, pubSignals);
        assertTrue(valid, "Entry proof verification failed");
    }

    // ============================================
    // DEPOSIT VERIFIER TEST
    // ============================================
    function test_DepositProof() public view {
        uint256[2] memory pA = [
            0x1fb4158264ff599aa444c3484b16a9044982087c1bee30d4fc06e7756bd296d5,
            0x2716f6d5e37ac560df50eb8bea700f56f781954b4dd6c199332f8818f02a86e9
        ];
        
        uint256[2][2] memory pB = [
            [
                0x193be3f80b8ba933156be90f999f68c4f6c03a5167d2f2669bf6c7094403a30f,
                0x2914c207e05181bf79b8dba34aeb81dd6c43f37a4c04dac986f045da6b3d3ce2
            ],
            [
                0x214c91229c2919978fbb3fe032a456548f20386dd81387ba0adc5a88f403c255,
                0x139677493ef3e0a0ad332eacf8356e1647115535fe992f1fc82b9ad191878b5d
            ]
        ];
        
        uint256[2] memory pC = [
            0x1a9c638bf49428c3afc936d1d71e5dca912d2a97478b6447ccba9c01d60b0f57,
            0x2d5facfa37e397f1bd23d6c2a5befdec77183e81b8f6d710fbc94b0af1b8a1aa
        ];
        
        uint256[11] memory pubSignals = [
            0x21da86c5319eb6c7196eea86135fef02db0c799cb3bba94fe1ad37ede4ad7006,
            0x2d5ad63655d80baca2747580cde392227f341bdeb524a5f8a047e0ec831350c1,
            0x1c722c1a80b94b21236a6c29465eba58a7fffa1e4905bfa3753ed81f774fb12b,
            0x0964e4610d7a39d60fa32cf16962afd4958f7e3c52a6010fb6b9c664fb4da36d,
            0x12b9e12fd488b20e8c189604d6572ed0645a1bc7599a83b7e34c45eccdd380db,
            0x0762fb531476f3facfc46e87ead6a9cfa8b7f488d11159817e7ec046f85afd76,
            0x1ed88042f29fb7443fed79238fdf3911c82361301d5fa76a98c5d06502dad21c,
            0x0000000000000000000000000000000000000000000000000000000000000002,
            0x0000000000000000000000000000000000000000000000000000000000000032,
            0x0000000000000000000000000000000000000000000000000000000000000001,
            0x031c769ca28b5048ba881e5f19e30327a24b0ddc12ea824337c2114875a70ef4
        ];
        
        bool valid = depositVerifier.verifyProof(pA, pB, pC, pubSignals);
        assertTrue(valid, "Deposit proof verification failed");
    }

    // ============================================
    // WITHDRAW VERIFIER TEST
    // ============================================
    function test_WithdrawProof() public view {
        uint256[2] memory pA = [
            0x251fc4507c5c3b6929b392f78f9e8b6ca55855b2a088ebc7da242e70a93b088b,
            0x06f03a96463c75a12d1cc35fd75f3a464878adad4ea4cc3c9d3b45b012beaa58
        ];
        
        uint256[2][2] memory pB = [
            [
                0x22b0b02ca3f7c519de3d1dd43c5b1074c631360933b120300827914c5ad8832e,
                0x0fe939fb9c3a33068d0aca8f1137d859fa3d2fe88c641e47996c7519577f9b0f
            ],
            [
                0x126d79849d7ed3043fb405677f5eb29c904b29f4745ebb1d8b19d4af4f1baf34,
                0x2892a6096e7bc4a44236089bb5fa74db5b229481238cbf82f5b15811f6ce07c9
            ]
        ];
        
        uint256[2] memory pC = [
            0x1f57acf2994fb2c16f7a12019a00d4f77981e52fae92b3beaf969c6603affa12,
            0x29cc1782b2c7d3a7785e6bb78522575ac5e634d4fa6c7e7d933a6b22c0216c9e
        ];
        
        uint256[15] memory pubSignals = [
            0x129c60a1b24c4c7faeee415ac45414754ad9c223d6bb664d8345656d98f99931,
            0x0595c6f2d27c7dedf32b04135f44b8f3ecb5da590b9607552cb3effdde01345c,
            0x1ed3458c1dbc2d6db00da8fccca2f08f79f2b4d7341a0765ae77bac001ba412d,
            0x1c722c1a80b94b21236a6c29465eba58a7fffa1e4905bfa3753ed81f774fb12b,
            0x0964e4610d7a39d60fa32cf16962afd4958f7e3c52a6010fb6b9c664fb4da36d,
            0x0f2d9a7f5c8b576b2950a279f9e539d2f4851bea54b9a1b64fb688920869c124,
            0x0cb76efafa7145c9847ae0626deea0c3712ea7915515627ceb0e70243b5e35ee,
            0x0000000000000000000000000000000000000000000000000000000000000002,
            0x0000000000000000000000000000000000000000000000000000000000000031,
            0x0000000000000000000000000000000000000000000000000000000000000001,
            0x036ab1ae0dff132795d491f0aab3fd1dcf702384108a21176b787c3d6cf78f9f,
            0x00000000000000000000000000000000000000000000000000000000000f4240,
            0x0000000000000000000000000000000000000000000000001234567890abcdef,
            0x000000000000000000000000742d35cc6634c0532925a3b8d4c9db96c4b4d8b6,
            0x0000000000000000000000000000000000000000000000000000000000000001
        ];
        
        bool valid = withdrawVerifier.verifyProof(pA, pB, pC, pubSignals);
        assertTrue(valid, "Withdraw proof verification failed");
    }

    // ============================================
    // SEND VERIFIER TEST
    // ============================================
    function test_SendProof() public view {
        uint256[2] memory pA = [
            0x2f2f155871a707553099f32c03454dcd6d032b3ce338e828d910b4a2e62107a7,
            0x1306b7f3ba1c068b319cc1597aa5ca9b30a5689eb10ad494d5105c1c99dc2d9c
        ];
        
        uint256[2][2] memory pB = [
            [
                0x2145ef560cb317aad1f6eff24aa38705bda8052856d2e9985530c0dd8d300462,
                0x13191d420189917edaa8855a8d467c9a327f834392c933d52ee0f7bbed4b9e6a
            ],
            [
                0x2a38eaf0f0d3cd8db0458ad9af628ed7572caa4f6cfcd323a80942a8783fadd3,
                0x25d4f003d47148adba1d2a05a03e4968c1936f86b82bb3ca6c16f6300b3a2520
            ]
        ];
        
        uint256[2] memory pC = [
            0x26cd1de68319ac077566debe815c1c9846adf894cc59754df0f8b6737566d3fb,
            0x02ba41d9da830ffe3fce7180a43ca52377aa0a420ddc8a39719631ff0a9efbdf
        ];
        
        uint256[17] memory pubSignals = [
            0x0c721739a2e231c6094d648747a766a48bd9817ff626d1191409b576dd8124ad,
            0x1ed3458c1dbc2d6db00da8fccca2f08f79f2b4d7341a0765ae77bac001ba412d,
            0x00506dfe3a7861ed78316e21e1fa2cebf74ec9f07c778d94cfcd7c10a8210ff3,
            0x1c722c1a80b94b21236a6c29465eba58a7fffa1e4905bfa3753ed81f774fb12b,
            0x0964e4610d7a39d60fa32cf16962afd4958f7e3c52a6010fb6b9c664fb4da36d,
            0x1a889ddd015c1a7ae0146d4e91004c76ed09178f6cabca9fe7a6eb35fccbf1e0,
            0x16d92907f228007ce8acbd563db28fe307f87cb2b545a9da5737bce7e23e1d99,
            0x0f2d9a7f5c8b576b2950a279f9e539d2f4851bea54b9a1b64fb688920869c124,
            0x0cb76efafa7145c9847ae0626deea0c3712ea7915515627ceb0e70243b5e35ee,
            0x2be77dccde602fd8cbe35a747c1bf77fabf2c914ecdebecdb2fb5d767c3367ba,
            0x06ae5c6eb783890aff48f80f36d11921a1c56a7f8a06369c2071b6e7bbab5e68,
            0x0000000000000000000000000000000000000000000000000000000000000002,
            0x0000000000000000000000000000000000000000000000000000000000000001,
            0x036ab1ae0dff132795d491f0aab3fd1dcf702384108a21176b787c3d6cf78f9f,
            0x1a889ddd015c1a7ae0146d4e91004c76ed09178f6cabca9fe7a6eb35fccbf1e0,
            0x16d92907f228007ce8acbd563db28fe307f87cb2b545a9da5737bce7e23e1d99,
            0x0000000000000000000000000000000000000000000000000000000000000001
        ];
        
        bool valid = sendVerifier.verifyProof(pA, pB, pC, pubSignals);
        assertTrue(valid, "Send proof verification failed");
    }

    // ============================================
    // ABSORB SEND VERIFIER TEST
    // ============================================
    function test_AbsorbSendProof() public view {
        uint256[2] memory pA = [
            0x2a22af0e6c35a319f26c2cf17d955f6b98b54327f41c4b7980be3ec938acf98a,
            0x0ab4829be671a35093537040b6ff8919b4e24b028c7a4e12a4bcda0f6f03a5ca
        ];
        
        uint256[2][2] memory pB = [
            [
                0x0a29526a380d0d146e7d8a7c90f6bb88a4b49672b345b98237541f0b15d0b7c4,
                0x2bc562011ab5d7d47ea8c9d42c8e0618a78185584efb75c18dbd32f44aeed7e7
            ],
            [
                0x1972b43d9a1f29f084709ddab24869b10b757b6bc2a35dcb7e7121661e03c975,
                0x2e68166bf6175ad0bddffb77231f91a1781ddcdcffffb645082a01cb1add91e0
            ]
        ];
        
        uint256[2] memory pC = [
            0x080f04ffef56e6b43afb0b9b91b73556f1891764f4f793be00dbdcad2ff9e6a6,
            0x1469f0c8fe2bbaf114e0abf81c7672abfaf0c7c9c2d49be04e10547bf8b94e25
        ];
        
        uint256[17] memory pubSignals = [
            0x1a86901ffbd64cf489720c776956241182459aaedac8d71dcb99a390a2d42715,
            0x2da3a559130baa8b5d1b112d7a99c903ae880bb18ae78c503e6bff41b7ed78ad,
            0x2a94b65d7be278be458c906352b4c26d8d31a82ee69ef51df861cca7f63a0751,
            0x1c722c1a80b94b21236a6c29465eba58a7fffa1e4905bfa3753ed81f774fb13d,
            0x0964e4610d7a39d60fa32cf16962afd4958f7e3c52a6010fb6b9c664fb4da39e,
            0x202c6b927f0c9e4f033a39ee7c08e630ac8e4f6e83e50f2716d35f1006b63163,
            0x0762c6a6f22b7ea5dd07e7743967686e54196bb1e97813a98809131b932de0ff,
            0x132cd14e6c3a1102613017b36bd487c636293b61f3ec23d7c12b414efa6e56c4,
            0x0a8fcdc116f8776fa2de8d54534a577ca2b011919f5cce1146352148ccddddd7,
            0x211fb3a5df5e7dcbebbe230b709779c347913da604b37938f7e5412838db7a09,
            0x0e61d8240851641d54458b5440e3e222e624e617ebdfe4252456ea4379405c1e,
            0x0000000000000000000000000000000000000000000000000000000000000002,
            0x0000000000000000000000000000000000000000000000000000000000000001,
            0x0eee838f09ab7b41da569d89de7787145c637a69362f9420f701f8acf4cd3472,
            0x202c6b927f0c9e4f033a39ee7c08e630ac8e4f6e83e50f2716d35f1006b63163,
            0x0762c6a6f22b7ea5dd07e7743967686e54196bb1e97813a98809131b932de0ff,
            0x0000000000000000000000000000000000000000000000000000000000000001
        ];
        
        bool valid = absorbSendVerifier.verifyProof(pA, pB, pC, pubSignals);
        assertTrue(valid, "AbsorbSend proof verification failed");
    }

    // ============================================
    // ABSORB WITHDRAW VERIFIER TEST
    // ============================================
    function test_AbsorbWithdrawProof() public view {
        uint256[2] memory pA = [
            0x2f402ae9754f1a2c104500a6b6b08ffb5160c2e53e69859ceb7fd3cd949ec0d7,
            0x2028c8032f510d47ff6664e325769f057a5b5f746b2c8a01b663071f81829ab3
        ];
        
        uint256[2][2] memory pB = [
            [
                0x0d59d25f248b2aba6d4285ab74b9d6eccaed92924c514e715e6f9a740a3455c9,
                0x0c19075d22051f0e10b23fda73dc1f3ffbb83110b091edb767635a0276987cdb
            ],
            [
                0x2229c39ae6c7f71409908b1ebcf0b641bd7f14b2a5118727b0899a09c0a96ddc,
                0x301dff0455a5b90b9404d36731c1a2a7da2f7f4fb4415c9e934d679c9681a5ff
            ]
        ];
        
        uint256[2] memory pC = [
            0x1e4ead0121364ed3b5581a17fe6f94f6ae02edefce83c1f0d1c6aaf92b6ad08f,
            0x03ec6c2f929c7a72da13527510a54dcaa139837794825ea18f881f12ee6b05f1
        ];
        
        uint256[15] memory pubSignals = [
            0x1228eacba798b96e2c468218df16288f2069e703c654cc1cb48ff9782ae507ca,
            0x2475f0dacbec40cdd2978ef422ef154ec7a51bb678ee491ef1de486b0298ff6c,
            0x2da3a559130baa8b5d1b112d7a99c903ae880bb18ae78c503e6bff41b7ed78ad,
            0x1c722c1a80b94b21236a6c29465eba58a7fffa1e4905bfa3753ed81f774fb13d,
            0x0964e4610d7a39d60fa32cf16962afd4958f7e3c52a6010fb6b9c664fb4da39e,
            0x132cd14e6c3a1102613017b36bd487c636293b61f3ec23d7c12b414efa6e56c4,
            0x0a8fcdc116f8776fa2de8d54534a577ca2b011919f5cce1146352148ccddddd7,
            0x0000000000000000000000000000000000000000000000000000000000000002,
            0x000000000000000000000000000000000000000000000000000000000000001e,
            0x0000000000000000000000000000000000000000000000000000000000000001,
            0x0eee838f09ab7b41da569d89de7787145c637a69362f9420f701f8acf4cd3472,
            0x00000000000000000000000000000000000000000000000000000000000f4240,
            0x0000000000000000000000000000000000000000000000001234567890abcdef,
            0x000000000000000000000000742d35cc6634c0532925a3b8d4c9db96c4b4d8b6,
            0x0000000000000000000000000000000000000000000000000000000000000001
        ];
        
        bool valid = absorbWithdrawVerifier.verifyProof(pA, pB, pC, pubSignals);
        assertTrue(valid, "AbsorbWithdraw proof verification failed");
    }
}
