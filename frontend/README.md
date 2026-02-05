# EVM Arkana Frontend

Next.js 15.3.1 frontend application with a dark arcane theme.

## Getting Started

### Prerequisites

1. **Anvil Local Node**: The app is configured to use Anvil local testnet (chain ID: 31337)
   - Install Foundry: https://book.getfoundry.sh/getting-started/installation
   - Start Anvil: `anvil` (runs on http://127.0.0.1:8545 by default)

2. **Reown Project ID**: Get your project ID from https://cloud.reown.com
   - Create a `.env.local` file in the `frontend` directory
   - Add: `NEXT_PUBLIC_PROJECT_ID=your_project_id_here`

3. **Pinata API Keys** (for TL Swap IPFS uploads): Get your free API keys from https://app.pinata.cloud/
   - Sign up at https://app.pinata.cloud/ (free tier available)
   - Go to API Keys section and create a new key
   - Add to `.env.local`:
     - `PINATA_API_KEY=your_api_key_here`
     - `PINATA_SECRET_API_KEY=your_secret_api_key_here`
   - These are server-side only (not exposed to client)
   - Pinata provides reliable IPFS pinning and gateway access

### Installation

Install dependencies:

```bash
pnpm install
```

### Running the App

1. Start Anvil (in a separate terminal):
```bash
anvil
```

2. Run the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Wallet Connect**: Connect your wallet using Reown/WalletConnect
- **Sign Sigil**: Sign the arcane message to generate your zkAddress
- **Zero-Knowledge Address**: Your transactions are protected by cryptographic sorcery

## Project Structure

- `app/` - Next.js app directory with pages and layout
- `components/` - React components
  - `ui/` - Reusable UI components (button, card, dialog, input)
  - `Navbar.tsx` - Navigation with wallet connect and sign sigil
  - `AppKitButtonWrapper.tsx` - Wallet connect button wrapper
- `lib/` - Utility functions
  - `zk-address.ts` - Zero-knowledge address computation
  - `buffer-polyfill.ts` - Buffer polyfill for browser compatibility
  - `crypto-keys.ts` - Cryptographic key generation
  - `store.ts` - IndexedDB storage utilities
- `context/` - React context providers
  - `AccountProvider.tsx` - Account and zkAddress management
  - `AccountStateProvider.tsx` - Account state management
  - `index.tsx` - Wagmi/Reown provider wrapper
- `hooks/` - Custom React hooks
  - `useAccountSigning.ts` - Hook for signing and zkAddress generation
- `config/` - Configuration files
  - `index.tsx` - Wagmi adapter and Anvil chain configuration

## Styling

The project uses Tailwind CSS v4 with a custom dark arcane theme. Theme variables are defined in `globals.css` and include custom animations and effects.

## Anvil Configuration

The app is configured to connect to Anvil local testnet:
- Chain ID: 31337
- RPC URL: http://127.0.0.1:8545
- Network: Anvil (local testnet)

Make sure Anvil is running before starting the development server.


