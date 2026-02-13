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
            0x028a74c790567c4df667eb22f45fe82e57e35376dade7d5d7b6ccb42854d3544,
            0x003b5192afcd1fd32bf756f778221971684ad3bb30443f45a45e85183cc0ac78
        ];
        
        uint256[2][2] memory pB = [
            [
                0x0f26062afea9159313a4a9b5b97c56651b4cd403e49f15b3ce28db4797a5f771,
                0x298368cd389121809815eac2f7e7a17363c4ea7982d6a5fd218babf0c4ec6d3d
            ],
            [
                0x1db4419d671a65f6ec0e8355089ac0c29343677cdf3f22527fa47c3b0982446d,
                0x1601d59f6766f73e3c31909f6a858cdaf6cc77c733d6cf6b18055ee0219210de
            ]
        ];
        
        uint256[2] memory pC = [
            0x117cb282e7e8cbe1f855baa315f9e0425ffdc65d6088699e6e5e017bd9ffbf9f,
            0x2e023091f3ed04a72fd3cba127a980871ce2701e0e2233b30a7f9ab41b95376e
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
            0x095b5af57b446c568d3dd41da6cc1302d6435839ab6851e2865e5238fbe00bb6,
            0x2863c36333276098d38e524f3c1e6f29ad4c0e4ea22c123c3fba2939c0a24183
        ];
        
        uint256[2][2] memory pB = [
            [
                0x161646f710c6b0cdf9624eb39c7d585fbef8c95db58ea6fd342074241fe3af74,
                0x2827f1c358fdf93f0ee2277fcf13c3ffe8267ede477b1f3155d1955971760e2e
            ],
            [
                0x06542b3dc2d1be5e8b0ed508259fbb5c922d67d43a030b0652a6541b897240d3,
                0x0f922ebe94d45bd37e399dac534cc592e0635570b88e59010c00189845f434e4
            ]
        ];
        
        uint256[2] memory pC = [
            0x1d45ca1927a90a09ffc50dda5fefe0a7e4756b21fccb5aea363a9625bf4c4416,
            0x1b12522dbdd0b7aa7d452676747d7bfc746891efada203d5b1b32d818179ac72
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
            0x29b24d54d59ce127eb4f2c26679759d0b8b3de45630e60ad73ed5738ca2d76c1,
            0x08421dc5e400b92084adc518fc3e37d7d7073be7756bd181e17c1250201d5315
        ];
        
        uint256[2][2] memory pB = [
            [
                0x1e2760dc585e928773d4a6a8b146033fb487c9202480dbe745d2d72c2d03d921,
                0x0a096b1c2a59f8d9c8ff6326f952d0517316ba98e4d33b0f783668a89e867995
            ],
            [
                0x11f1c9e88fba8bc01cffc56b390c0d58bd80404798a92ff6c40aa9faa9f60d78,
                0x2a27194fe085afb66b7c9dab024ecde4e670dd1528c8416e29ae3ac03e720523
            ]
        ];
        
        uint256[2] memory pC = [
            0x2dda1c567dd572de8e3a650f342be6c5fd26c4335b2c186bbf7fe368eca5cd55,
            0x1e3a51c8106a8dbd352186a48ae78c372e43accb0603876fdb4ff5e4cca3003f
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
            0x0470d50790d40ff65abc0ac54dc719617908aa7040a82ae8217da1b128a1441e,
            0x12de3d81c0dc5f42582326a85e637b752ee1436dcefe01981ddd6ab524237491
        ];
        
        uint256[2][2] memory pB = [
            [
                0x093d2f7d1539e16c43f6e90e4ebccd8155448e3603936f3906e3f8ad5b6a0243,
                0x16c98f780bb7a764e2d63c66b9bff870bf47f03d591432e604abd10f5f7766a1
            ],
            [
                0x0b3e0438e6f7650ab4967f50a2b845a72ac6e4789b4e0f49cff4d0722c556be5,
                0x10899706a2ddbb115e26779060f2726db16d92ffe256832b6b4c1b9c09e3198a
            ]
        ];
        
        uint256[2] memory pC = [
            0x1fac553d89630286ec9ddf4e0746020f1ac5d46a4e36e4c22778462ef9efcb61,
            0x1267239720d5637c775a4c8e592a86007bf80cd6f140c26ba9eeae4aea2be735
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
            0x2652bd653b15e3986012d007e0687f31e303aeb8b76615a9ae75c02fe7383169,
            0x1fc864a3e76ea2066478875219acfa35608965d02ad31a5bc191c686219543ee
        ];
        
        uint256[2][2] memory pB = [
            [
                0x2597ef922d929883fb16130461c6a7368a88182905ceaa6294552cef2859e55d,
                0x1a0479d8f7d4ed3d0f4d5066c79460a34b97c5e7b4a6a448fbaf28b75b393c49
            ],
            [
                0x24aa4a8303a11401581432a196d6a8c524fd34b23505b43257abfeedb2c05d21,
                0x0e73019a8c243aae098ffbe7af1e7d6473e645bf21dfee6cad12040251f1a7c1
            ]
        ];
        
        uint256[2] memory pC = [
            0x1f5e3eb55891d13d22f46357ec2441148f82593dd8120e05e45c4a9360a46eb1,
            0x0f6353704a6e9896b767bb0a1c9d7ebdbbb9e259918f2e59f907aa3383762dd7
        ];
        
        uint256[18] memory pubSignals = [
            0x2094dfb9ad93891047d22416c43e017b4b130eea101b76ce062c7b300ba2eaed,
            0x2da3a559130baa8b5d1b112d7a99c903ae880bb18ae78c503e6bff41b7ed78ad,
            0x2a94b65d7be278be458c906352b4c26d8d31a82ee69ef51df861cca7f63a0751,
            0x1c722c1a80b94b21236a6c29465eba58a7fffa1e4905bfa3753ed81f774fb138,
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
            0x0000000000000000000000000000000000000000000000000000000000000005,
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
            0x079ab7342c88b66edabe7b301c10fb4d2bc658477a8b1285cc865a3188b580a5,
            0x0e66945800007ba9b60053f2ff97faf8c81ff5923132e6195eeca8bd7d649bda
        ];
        
        uint256[2][2] memory pB = [
            [
                0x1920a653d005d09f13f52b50a30cccc5a320f13dd996aad0edde322dac284a1f,
                0x08a03e6eddc7e303b2735e9eee820d318b8e8e3f4b54e40e7bede1daed3435a5
            ],
            [
                0x176276b4f2e4d14d8ed3f08723569f2d8408de163b185d4fbbb6fe1ea16f5a75,
                0x03c522b0a35a7cc9fbf3401ce071645bfdc8871cc47b4754fb877e6466faa134
            ]
        ];
        
        uint256[2] memory pC = [
            0x0def696f2eca7274adf8b4bdcbc7381883236d5b520f36242434f4977751b6a6,
            0x0be76a3617490a3a784c84ccc87df622cbcea825c218db3bf9c9622f87b5fcef
        ];
        
        uint256[16] memory pubSignals = [
            0x2da7ed7a354aaf6f3162d345dd70c0754c2553b863c3478ae8eb7a0b260bb748,
            0x142eade5f012e769f5f3ada9610c933a4c39848ca409c8d92471094ed48d2c51,
            0x2da3a559130baa8b5d1b112d7a99c903ae880bb18ae78c503e6bff41b7ed78ad,
            0x1c722c1a80b94b21236a6c29465eba58a7fffa1e4905bfa3753ed81f774fb138,
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
            0x0000000000000000000000000000000000000000000000000000000000000005,
            0x0000000000000000000000000000000000000000000000000000000000000001
        ];
        
        bool valid = absorbWithdrawVerifier.verifyProof(pA, pB, pC, pubSignals);
        assertTrue(valid, "AbsorbWithdraw proof verification failed");
    }
}
