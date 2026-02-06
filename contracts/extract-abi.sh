#!/bin/bash

# Extract ABI from Arkana.json using jq
jq '.abi' out/Arkana.sol/Arkana.json > Arkana.abi.json
echo "ABI extracted to Arkana.abi.json"

# Extract ABI from TLswapRegister.json using jq
jq '.abi' out/TLswapRegister.sol/TLswapRegister.json > TLswapRegister.abi.json
echo "ABI extracted to TLswapRegister.abi.json"

