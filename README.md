# Arkana

> **⚠️ Hackathon Project Disclaimer**
> 
> This project was built for **EthGlobal MoneyHack2026**. This is a proof-of-concept implementation and **should not be used in production**.
> 
> **Security Warning**: This codebase contains known and potentially unknown vulnerabilities. The code is incomplete and has not undergone comprehensive security audits. Just dont use it!

A privacy-preserving DeFi protocol that enables private deposits, withdrawals, and timelock-encrypted swap operations using zero-knowledge proofs.

## Overview

Arkana is a zero-knowledge privacy protocol built on Ethereum that allows users to:
- **Deposit tokens** with complete privacy using cryptographic commitments
- **Withdraw tokens** without revealing balances or transaction history
- **Execute timelock-encrypted swaps** and liquidity operations that unlock at future dates
- **Earn yield** through Aave integration while maintaining privacy

All operations are verified using zero-knowledge proofs (Noir circuits), ensuring that transaction details remain private while maintaining cryptographic integrity.

## Architecture

### Core Components

#### **Arkana Contract** (`contracts/src/Arkana.sol`)
The main protocol contract that manages:
- **Merkle Tree State**: Uses Poseidon2 hashing to maintain private balance commitments in incremental Merkle trees
- **Zero-Knowledge Verification**: Verifies Noir circuit proofs for entry, deposit, and withdraw operations
- **Vault Management**: Creates and manages ERC4626 vaults for each supported token
- **Aave Integration**: Automatically deposits user funds to Aave for yield generation

#### **ArkanaVault** (`contracts/src/ArkanaVault.sol`)
ERC4626-compliant vaults that:
- Wrap Aave aTokens as vault shares
- Provide standard ERC4626 interface for deposits/withdrawals
- Enable yield generation through Aave while maintaining privacy

#### **TLswapRegister** (`contracts/src/tl-limit/TLswapRegister.sol`)
Registry for timelock-encrypted operations:
- **Timelock Encryption**: Orders encrypted using drand beacons, decryptable only after specific rounds
- **Swap Execution**: Executes swaps via Uniswap V4 Universal Router
- **Liquidity Provision**: Adds liquidity to Uniswap V4 pools
- **Hash Chain Validation**: Ensures order integrity using keccak256 hashes and Poseidon2 hash chains

### Protocol Flow Diagrams

The following diagrams illustrate how the protocol works:

#### Deposit Flow

```mermaid
graph TB
    A[User] -->|1. Transfer tokens| B[Arkana Contract]
    B -->|2. Approve tokens| C[ArkanaVault]
    C -->|3. supplyToAave| D[Aave Pool]
    D -->|4. Returns aTokens| C
    C -->|5. Holds aTokens as assets| C
    B -->|6. mintShares| C
    C -->|7. Mints ERC4626 shares| E[Arkana holds shares]

    style A fill:#e1f5ff,stroke:#333,stroke-width:2px,color:#000
    style B fill:#fff3cd,stroke:#333,stroke-width:2px,color:#000
    style C fill:#d4edda,stroke:#333,stroke-width:2px,color:#000
    style D fill:#f8d7da,stroke:#333,stroke-width:2px,color:#000
    style E fill:#d4edda,stroke:#333,stroke-width:2px,color:#000
```

#### Withdraw Flow

```mermaid
graph TB
    F[User] -->|1. ZK Proof + withdraw| G[Arkana Contract]
    G -->|2. convertToAssets| H[ArkanaVault]
    G -->|3. burnShares| H
    H -->|4. withdrawFromAave| I[Aave Pool]
    I -->|5. Burns aTokens, returns tokens| H
    H -->|6. Transfer tokens| G
    G -->|7a. Pay relayer fee| J[Relayer]
    G -->|7b. Transfer to receiver| K[Receiver Address]

    style F fill:#e1f5ff,stroke:#333,stroke-width:2px,color:#000
    style G fill:#fff3cd,stroke:#333,stroke-width:2px,color:#000
    style H fill:#d4edda,stroke:#333,stroke-width:2px,color:#000
    style I fill:#f8d7da,stroke:#333,stroke-width:2px,color:#000
    style J fill:#e7e7e7,stroke:#333,stroke-width:2px,color:#000
    style K fill:#e1f5ff,stroke:#333,stroke-width:2px,color:#000
```

#### Timelock Swap (TL_SWAP) Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as Arkana
    participant T as TLswapRegister
    participant D as dRand
    participant E as Executor
    participant V as Vault
    participant AA as Aave
    participant S as Uniswap
    participant R as Recipient

    Note over U,T: Phase 1: Registration
    U->>A: 1. withdraw(ZK proof, is_tl_swap=true)
    A->>A: 2. Virtual withdrawal (no vault op)
    A->>T: 3. registerEncryptedOrder(ciphertext)

    Note over D,T: Phase 2: Timelock Release
    D-->>E: 4. Randomness published at round R
    E->>E: 5. Decrypt order off-chain
    E->>T: 6. executeV4SwapIntent(params)

    Note over T,AA: Phase 3: Withdrawal
    T->>A: 7. withdrawForSwap(shares)
    A->>V: 8. burnShares + withdraw
    V->>AA: 9. Redeem from Aave
    AA-->>V: 10. Return tokens
    V-->>T: 11. Transfer tokens

    Note over T,R: Phase 4: Swap & Distribute
    T->>S: 12. Swap via Universal Router
    S-->>T: 13. Return output tokens
    T-->>E: 14. Pay execution fee
    T-->>R: 15. Transfer remainder
```

#### Vault Asset Tracking

```mermaid
graph TB
    V[ArkanaVault ERC4626]
    V -->|asset = aToken| W[Holds aTokens from Aave]
    V -->|totalAssets| X[Returns vault's aToken balance]
    V -->|totalSupply| Y[Returns total shares minted]
    V -->|convertToShares/Assets| Z[Uses ERC4626 standard formula]

    style V fill:#d4edda,stroke:#333,stroke-width:2px,color:#000
    style W fill:#f8d7da,stroke:#333,stroke-width:2px,color:#000
    style X fill:#e7e7e7,stroke:#333,stroke-width:2px,color:#000
    style Y fill:#e7e7e7,stroke:#333,stroke-width:2px,color:#000
    style Z fill:#e7e7e7,stroke:#333,stroke-width:2px,color:#000
```

#### DRAND Timelock Encryption

```mermaid
graph TB
    AA[User encrypts order] -->|AES-128 with dRand round R| AB[Ciphertext]
    AC[dRand Network] -->|Publishes randomness at round R| AD[Public randomness]
    AB -->|Decryptable after round R| AE[Executor decrypts]
    AE -->|Extract: sharesAmount, tokenOut, amountOutMin, etc| AF[Execute swap]
    
    AG[Hash Chain Verification]
    AG -->|hash prevHash, sharesAmount = nextHash| AH[Prevents chunk reuse]
    AG -->|Mark prevHash as used nullifier| AH

    style AA fill:#e1f5ff,stroke:#333,stroke-width:2px,color:#000
    style AB fill:#ffe8cc,stroke:#333,stroke-width:2px,color:#000
    style AC fill:#f0e6ff,stroke:#333,stroke-width:2px,color:#000
    style AD fill:#f0e6ff,stroke:#333,stroke-width:2px,color:#000
    style AE fill:#e7e7e7,stroke:#333,stroke-width:2px,color:#000
    style AF fill:#cce5ff,stroke:#333,stroke-width:2px,color:#000
    style AG fill:#fff3cd,stroke:#333,stroke-width:2px,color:#000
    style AH fill:#d4edda,stroke:#333,stroke-width:2px,color:#000
```

### Zero-Knowledge Circuits

The protocol uses Noir circuits for zero-knowledge proof generation:

- **Entry Circuit**: Initializes a new account in the Merkle tree
- **Deposit Circuit**: Proves deposit of tokens without revealing amount
- **Withdraw Circuit**: Proves withdrawal with optional timelock swap operations

All circuits use Poseidon2 hashing for efficient zero-knowledge operations.

## Features

### 🔐 Privacy-Preserving Operations

- **Private Balances**: Your token balances are stored as cryptographic commitments in a Merkle tree
- **Private Transactions**: Deposit and withdrawal amounts are hidden from observers
- **Zero-Knowledge Proofs**: All operations verified using zk-SNARKs without revealing private data

### 💰 Yield Generation

- **Aave Integration**: Deposited tokens are automatically supplied to Aave for yield
- **ERC4626 Vaults**: Standard vault interface for each token
- **Real-time Yield**: Earn interest while maintaining privacy

### ⏰ Timelock Swaps

- **Encrypted Orders**: Create swap or liquidity orders encrypted with drand beacons
- **Future Execution**: Orders unlock at specific drand rounds (time-based)
- **Nested Encryption**: Support for order chains with multiple unlock dates
- **Uniswap V4 Integration**: Direct execution on Uniswap V4 pools

### 🎯 Operation Modes

- **Mage Mode**: Standard mode where each token has its own nonce that increases vertically
- **Archon Mode**: Liquidity provision mode with horizontal `user_key` increments (limited to 2 vertical nonces per key)

## Technical Details

### Cryptographic Primitives

- **Poseidon2**: Used for Merkle tree hashing and commitment generation
- **Baby Jubjub**: Elliptic curve for zero-knowledge address generation
- **BN254**: Elliptic curve for pairing-based cryptography (timelock encryption)
- **Poseidon2 KDF**: Key derivation for AES encryption
- **AES-128-CBC**: Symmetric encryption for order data

### Merkle Tree Structure

- **Incremental Merkle Tree (IMT)**: Lean IMT implementation using Poseidon2
- **Per-Token Trees**: Each token has its own Merkle tree
- **Historical States**: Tracks all tree roots for proof generation
- **Minimum Depth**: All proofs are at least 8 levels deep for security

### Timelock Encryption

Orders are encrypted using:
1. **drand Beacons**: Time-based randomness from drand network
2. **BN254 Pairings**: Cryptographic pairings for timelock verification
3. **AES Encryption**: Symmetric encryption of order parameters
4. **IPFS Storage**: Encrypted orders stored on IPFS

## Getting Started

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **Foundry** (for contract development and testing)
- **Anvil** (local Ethereum node for development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd evm-arkana-monorepo
```

2. Install dependencies:
```bash
# Frontend
cd frontend
pnpm install

# Contracts
cd ../contracts
forge install
```

3. Set up environment variables:

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_PROJECT_ID=your_reown_project_id
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt
```

### Running Locally

1. Start Anvil (in a separate terminal):
```bash
anvil
```

2. Deploy contracts:
```bash
cd contracts
./script/anvil_deploy.sh
```

3. Start the frontend:
```bash
cd frontend
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Initializing Your Account

1. **Connect Wallet**: Connect your Ethereum wallet using WalletConnect
2. **Sign Sigil**: Sign the Arkana message to generate your zero-knowledge address
3. **Initialize**: Create your first deposit to initialize your account in the Merkle tree

### Depositing Tokens

1. Navigate to the **Rituals** page
2. Select a token and amount
3. Choose **Mage** or **Archon** mode
4. Generate proof and submit transaction
5. Your balance is now privately committed in the Merkle tree

### Withdrawing Tokens

1. Navigate to the **Withdraw** page
2. Select token and amount
3. Choose withdrawal type:
   - **Standard Withdrawal**: Direct withdrawal to an address
   - **Timelock Swap**: Encrypted swap order that unlocks at a future date
   - **Timelock Liquidity**: Encrypted liquidity provision order
4. Generate proof and submit transaction

### Decrypting Timelock Orders

1. Navigate to the **Decrypt** page
2. Select token and nonce
3. The system automatically:
   - Computes the nonce commitment
   - Fetches encrypted order from IPFS
   - Decrypts when the drand round is available
4. Simulate or execute the swap/liquidity operation

## Project Structure

```
evm-arkana-monorepo/
├── contracts/          # Solidity smart contracts
│   ├── src/
│   │   ├── Arkana.sol              # Main protocol contract
│   │   ├── ArkanaVault.sol         # ERC4626 vault implementation
│   │   └── tl-limit/
│   │       └── TLswapRegister.sol  # Timelock swap registry
│   └── test/           # Foundry tests
├── circuits/           # Noir zero-knowledge circuits
│   └── main/
│       ├── entry/      # Account initialization circuit
│       ├── deposit/   # Deposit circuit
│       └── withdraw/  # Withdrawal circuit
├── frontend/           # Next.js frontend application
│   ├── app/            # Next.js app directory
│   │   ├── rituals/   # Deposit/initialize page
│   │   ├── withdraw/  # Withdrawal page
│   │   └── decrypt/   # Order decryption page
│   └── components/    # React components
└── ts-utils/           # TypeScript utilities
```

## Security Considerations

⚠️ **Important**: This is a hackathon project and has not been audited. Do not use with real funds.

- **Private Key Management**: User signatures are used to derive private keys client-side. Never share your signature.
- **Proof Generation**: All proofs are generated client-side. The private key never leaves your device.
- **Hash Chain Validation**: Timelock orders use hash chains to ensure integrity and prevent tampering.
- **Order Integrity**: All order parameters are hashed and validated on-chain before execution.
- **Known Limitations**: The codebase is incomplete and may contain vulnerabilities. Use only for testing and demonstration purposes.

## Development

### Building Contracts

```bash
cd contracts
forge build --via-ir
```

### Running Tests

```bash
cd contracts
forge test --via-ir
```

### Building Circuits

```bash
cd circuits
nargo compile
```

## License

MIT
