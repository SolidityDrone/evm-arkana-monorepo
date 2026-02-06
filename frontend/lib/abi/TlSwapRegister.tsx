const TLSWAP_REGISTER_ADDRESS = "0x9841806AC68865af1FDE1033e04cC4241D4f911b";
const TLSWAP_REGISTER_ABI = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_arkana",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_uniswapRouter",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_poseidon2Huff",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "MAX_SLIPPAGE_BPS",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "arkana",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract Arkana"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "encryptedOrdersByNonce",
        "inputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "executeSwapIntent",
        "inputs": [
            {
                "name": "intentId",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "intentor",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "sharesAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "tokenIn",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenOut",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amountOutMin",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "slippageBps",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "deadline",
                "type": "uint24",
                "internalType": "uint24"
            },
            {
                "name": "executionFeeBps",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "recipient",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "drandRound",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "swapCalldata",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "swapTarget",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "prevHash",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "nextHash",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "tlHashchain",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "amountOut",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getDrandInfos",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct TLswapRegister.DrandInfo",
                "components": [
                    {
                        "name": "publicKey",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "period",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "genesisTime",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "genesisSeed",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "chainHash",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "scheme",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "beaconId",
                        "type": "string",
                        "internalType": "string"
                    }
                ]
            }
        ],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "getEncryptedOrder",
        "inputs": [
            {
                "name": "orderId",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "poseidon2Hasher",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract Poseidon2HuffWrapper"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "protocolFeeBps",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "registerEncryptedOrder",
        "inputs": [
            {
                "name": "newNonceCommitment",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "ciphertextIpfs",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [
            {
                "name": "orderId",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setArkana",
        "inputs": [
            {
                "name": "_arkana",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setProtocolFee",
        "inputs": [
            {
                "name": "_protocolFeeBps",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
            {
                "name": "newOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "uniswapRouter",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "usedHashChainNodes",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "withdrawVirtuallyLockedFunds",
        "inputs": [
            {
                "name": "tokenAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "sharesAmount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "EncryptedOrderRegistered",
        "inputs": [
            {
                "name": "orderId",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "ciphertextIpfs",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "SwapIntentExecuted",
        "inputs": [
            {
                "name": "intentId",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "executor",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "intentor",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "tokenIn",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "tokenOut",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "amountIn",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "amountOut",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "HashChainNodeAlreadyUsed",
        "inputs": []
    },
    {
        "type": "error",
        "name": "IntentExpired",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidAmounts",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidCiphertext",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidDeadline",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidHashChain",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidRound",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidSlippage",
        "inputs": []
    },
    {
        "type": "error",
        "name": "OnlyArkana",
        "inputs": []
    },
    {
        "type": "error",
        "name": "OnlyOwner",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ReentrancyGuardReentrantCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "SafeERC20FailedOperation",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "SwapFailed",
        "inputs": []
    }
] as const;

export { TLSWAP_REGISTER_ADDRESS, TLSWAP_REGISTER_ABI };