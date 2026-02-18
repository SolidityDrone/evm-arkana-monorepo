#!/usr/bin/env bash
# Debug getIncomingNotesCount for a zk address and token.
# Usage:
#   TOKEN_ADDRESS=0x... ./scripts/debug-incoming-notes.sh
#   ./scripts/debug-incoming-notes.sh "zk06c7b2d26c93ebb935b2be6a011c296cb6791da78031e20f95d9c0307a3cf67621c372e0f8f565455d5cd5b0262ea80b0fc61fff394cc04e6450020dd84d6ae8" 0xYourTokenAddress
#
# Optional env: RPC_URL, ARKANA_ADDRESS (default from contracts/deployed_addresses.txt)

set -e

ZK="${1:-${ZK_ADDRESS}}"
TOKEN="${2:-${TOKEN_ADDRESS}}"
RPC="${RPC_URL:-http://127.0.0.1:8545}"

if [ -z "$TOKEN" ]; then
  echo "Usage: TOKEN_ADDRESS=0x... $0 [zk_address]"
  echo "  or:  $0 <zk_address> <token_address>"
  exit 1
fi

# Resolve Arkana address
if [ -n "$ARKANA_ADDRESS" ]; then
  ARKANA="$ARKANA_ADDRESS"
else
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
  if [ -f "$ROOT/contracts/deployed_addresses.txt" ]; then
    ARKANA=$(grep ARKANA_ADDRESS "$ROOT/contracts/deployed_addresses.txt" | cut -d= -f2)
  fi
fi
if [ -z "$ARKANA" ]; then
  ARKANA="0xe3f89724666d4220e816c80bafcC993337a5e1BF"
fi

# Strip zk prefix and ensure 128 hex chars (64 + 64 for x, y)
RAW="${ZK#zk}"
RAW="${RAW#0x}"
if [ ${#RAW} -ne 128 ]; then
  echo "Expected zk address to have 128 hex chars (64+64), got ${#RAW}"
  exit 1
fi

X="0x${RAW:0:64}"
Y="0x${RAW:64:64}"

# keccak256(abi.encodePacked(uint256, uint256)) — same as abi.encode for two uint256
ENCODED=$(cast abi-encode "f(uint256,uint256)" "$X" "$Y")
PUBKEY_HASH=$(cast keccak "$ENCODED")

echo "zk address: $ZK"
echo "x: $X"
echo "y: $Y"
echo "pubkeyHash: $PUBKEY_HASH"
echo "token: $TOKEN"
echo "arkana: $ARKANA"
echo "rpc: $RPC"
echo ""
echo "Calling getIncomingNotesCount..."
cast call "$ARKANA" "getIncomingNotesCount(address,bytes32)" "$TOKEN" "$PUBKEY_HASH" --rpc-url "$RPC"
echo ""
echo "Done. If count is 0, the note may be under a different token or receiver pubkey."
