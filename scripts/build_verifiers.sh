#!/bin/bash

# Script to build and generate Circom2 verifiers for all Arkana circuits
# This script executes the following for each circuit:
# 1. Compile circuit with circom (generates .r1cs and .wasm)
# 2. Generate trusted setup (powers of tau) if needed
# 3. Generate proving key and verification key with snarkjs
# 4. Generate Solidity verifier with snarkjs
# 5. Save verifier to contracts/src/Verifiers/

set -e  # Exit on any error

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CIRCOM_DIR="$PROJECT_ROOT/circom"
CONTRACTS_DIR="$PROJECT_ROOT/contracts"

cd "$CIRCOM_DIR"

# Array of circuit names
all_circuits=("entry" "deposit" "withdraw" "send" "absorb_send" "absorb_withdraw")

# Parse command line argument or prompt user for circuit selection
if [ $# -gt 0 ]; then
    selected_circuit="$1"
    # Validate circuit name
    if [[ ! " ${all_circuits[@]} " =~ " ${selected_circuit} " ]]; then
        echo "Error: Invalid circuit name: $selected_circuit"
        echo "Valid circuits: ${all_circuits[*]}"
        exit 1
    fi
    circuits=("$selected_circuit")
    echo "Building verifier for circuit: $selected_circuit"
else
    # Interactive prompt
    echo "Which circuit would you like to build?"
    echo "  1) entry"
    echo "  2) deposit"
    echo "  3) withdraw"
    echo "  4) send"
    echo "  5) absorb_send"
    echo "  6) absorb_withdraw"
    echo "  7) all"
    echo ""
    read -p "Enter your choice (1-7): " choice
    
    case $choice in
        1)
            circuits=("entry")
            echo "Building verifier for circuit: entry"
            ;;
        2)
            circuits=("deposit")
            echo "Building verifier for circuit: deposit"
            ;;
        3)
            circuits=("withdraw")
            echo "Building verifier for circuit: withdraw"
            ;;
        4)
            circuits=("send")
            echo "Building verifier for circuit: send"
            ;;
        5)
            circuits=("absorb_send")
            echo "Building verifier for circuit: absorb_send"
            ;;
        6)
            circuits=("absorb_withdraw")
            echo "Building verifier for circuit: absorb_withdraw"
            ;;
        7)
            circuits=("${all_circuits[@]}")
            echo "Building verifiers for all circuits: ${circuits[*]}"
            ;;
        *)
            echo "Invalid choice. Exiting."
            exit 1
            ;;
    esac
fi

# Powers of Tau file
# Option 1: Use a public trusted setup (recommended for production)
# Option 2: Generate a new one (for testing)
POTAU_FILE="$CIRCOM_DIR/powers_of_tau.ptau"
# Default power (will be set per circuit)
# Power 17 (131K) for most circuits, Power 18 (262K) for absorb_send
POTAU_POWER=17  # Will be set per circuit
# Public trusted setup URLs (different powers available)
# Priority: Google Cloud Storage (zkevm) - most reliable source
declare -A POTAU_URLS
POTAU_URLS[17]="https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_17.ptau"  # Power 17 (131K) - for most circuits
POTAU_URLS[18]="https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_18.ptau"  # Power 18 (262K) - for absorb_send

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
echo "Checking required tools..."
if ! command_exists circom; then
    echo "Error: circom not found. Please install circom2."
    exit 1
fi

if ! command_exists snarkjs; then
    echo "Error: snarkjs not found. Please install snarkjs: npm install -g snarkjs"
    exit 1
fi

echo "✓ All required tools found"
echo ""

# Function to get circuit size (number of constraints)
get_circuit_size() {
    local r1cs_file=$1
    if [ -f "$r1cs_file" ]; then
        # snarkjs r1cs info outputs: "# of Constraints: X"
        # Extract the number after "Constraints: "
        local size=$(snarkjs r1cs info "$r1cs_file" 2>&1 | grep -oE "# of Constraints: [0-9]+" | grep -oE "[0-9]+" | head -1)
        if [ -z "$size" ] || [ "$size" = "0" ]; then
            echo "0"
        else
            echo "$size"
        fi
    else
        echo "0"
    fi
}

# Function to check if powers of tau is large enough for circuit
check_potau_size() {
    local r1cs_file=$1
    local potau_file=$2
    
    if [ ! -f "$r1cs_file" ] || [ ! -f "$potau_file" ]; then
        return 1
    fi
    
    local circuit_size=$(get_circuit_size "$r1cs_file")
    if [ "$circuit_size" = "0" ]; then
        return 1
    fi
    
    # Groth16 needs 2*constraints, so we need power such that 2^power >= 2*circuit_size
    local required_size=$((circuit_size * 2))
    local required_power=15  # Start from 15 (2^15 = 32768)
    
    # Find the minimum power needed
    while [ $((2 ** required_power)) -lt "$required_size" ]; do
        required_power=$((required_power + 1))
    done
    
    # Check if current POTAU_POWER is sufficient
    if [ "$POTAU_POWER" -lt "$required_power" ]; then
        echo "Error: Circuit has $circuit_size constraints (needs 2*$circuit_size = $required_size for Groth16)"
        echo "Current powers of tau power: $POTAU_POWER (supports up to $((2 ** POTAU_POWER)))"
        echo "Required power: $required_power (supports up to $((2 ** required_power)))"
        return 1
    fi
    
    return 0
}

# Function to generate or download powers of tau
setup_powers_of_tau() {
    # Check if powers of tau file already exists and has reasonable size
    # We skip verification to avoid long delays - if the file exists and is large enough, we assume it's valid
    if [ -f "$POTAU_FILE" ]; then
        local file_size=$(stat -f%z "$POTAU_FILE" 2>/dev/null || stat -c%s "$POTAU_FILE" 2>/dev/null || echo 0)
        
        # For power 17, file should be at least ~144MB
        # Use a conservative check: if file is > 10MB, assume it's valid
        if [ "$file_size" -gt 10485760 ]; then
            echo "✓ Using existing powers of tau file: $POTAU_FILE (size: $(($file_size / 1048576))MB)"
            echo "  (Skipping verification for speed - if circuit fails, delete the file to regenerate)"
            return 0
        else
            echo "Existing powers of tau file is too small (size: $(($file_size / 1048576))MB), will download/generate new one..."
            rm -f "$POTAU_FILE"
        fi
    fi
    
    # Try to download public trusted setup first (faster and more secure)
    # Use the URL for the specific power needed
    echo "Attempting to download powers of tau (need power $POTAU_POWER)..."
    
    local url="${POTAU_URLS[$POTAU_POWER]}"
    if [ -z "$url" ]; then
        echo "Error: No URL configured for power $POTAU_POWER"
        return 1
    fi
    
    echo "  Downloading: $url"
    if command_exists wget; then
            if wget --quiet --show-progress -O "$POTAU_FILE" "$url" 2>&1; then
                # Check if file was downloaded and has reasonable size (> 1MB)
                if [ -f "$POTAU_FILE" ] && [ $(stat -f%z "$POTAU_FILE" 2>/dev/null || stat -c%s "$POTAU_FILE" 2>/dev/null || echo 0) -gt 1048576 ]; then
                    echo "✓ Powers of tau downloaded: $POTAU_FILE"
                    return 0
                else
                echo "  Download failed or file too small"
                    rm -f "$POTAU_FILE"
                fi
            fi
    elif command_exists curl; then
            if curl -L --progress-bar -f -o "$POTAU_FILE" "$url" 2>&1; then
                # Check if file was downloaded and has reasonable size (> 1MB)
                if [ -f "$POTAU_FILE" ] && [ $(stat -f%z "$POTAU_FILE" 2>/dev/null || stat -c%s "$POTAU_FILE" 2>/dev/null || echo 0) -gt 1048576 ]; then
                    echo "✓ Powers of tau downloaded: $POTAU_FILE"
                    return 0
                else
                echo "  Download failed or file too small"
                    rm -f "$POTAU_FILE"
                fi
            fi
    fi
    
    echo "Warning: Could not download public powers of tau from any source."
    echo "Generating new one locally (for testing only)..."
    echo "Power: 2^$POTAU_POWER (this will take approximately:"
    if [ "$POTAU_POWER" -le 18 ]; then
        echo "  ~5-10 minutes for power $POTAU_POWER)"
    elif [ "$POTAU_POWER" -le 20 ]; then
        echo "  ~15-30 minutes for power $POTAU_POWER)"
    elif [ "$POTAU_POWER" -le 22 ]; then
        echo "  ~1-2 hours for power $POTAU_POWER)"
    else
        echo "  ~several hours for power $POTAU_POWER - consider using a lower power!)"
    fi
    
    # Start powers of tau ceremony
    echo "Starting powers of tau ceremony..."
    snarkjs powersoftau new bn128 "$POTAU_POWER" "pot_0000.ptau" -v || {
        echo "Error: Failed to generate powers of tau"
        exit 1
    }
    
    # Contribute to the ceremony (random contribution)
    # Generate random entropy automatically - this makes it non-interactive
    local entropy=$(openssl rand -hex 32)
    echo "Contributing to powers of tau with random entropy (non-interactive)..."
    echo "$entropy" | snarkjs powersoftau contribute "pot_0000.ptau" "pot_0001.ptau" --name="First contribution" -v || {
        echo "Error: Failed to contribute to powers of tau"
        exit 1
    }
    
    # Prepare phase 2 (this may take a while for power 17)
    echo "Preparing phase 2 (this may take a while for power $POTAU_POWER)..."
    echo "Preparing phase 2 (this may take a while for power $POTAU_POWER)..."
    snarkjs powersoftau prepare phase2 "pot_0001.ptau" "$POTAU_FILE" -v || {
        echo "Error: Failed to prepare phase 2"
        exit 1
    }
    
    # Clean up intermediate files
    rm -f pot_0000.ptau pot_0001.ptau
    
    echo "✓ Powers of tau generated: $POTAU_FILE"
    echo "⚠️  WARNING: This is a test setup. For production, use a public trusted setup!"
}

# Function to process a single circuit
process_circuit() {
    local circuit_name=$1
    local circuit_file="main/$circuit_name/${circuit_name}.circom"
    local build_dir="build/$circuit_name"
    local r1cs_file="$build_dir/${circuit_name}.r1cs"
    local wasm_file="$build_dir/${circuit_name}_js/${circuit_name}.wasm"
    local zkey_file="$build_dir/${circuit_name}_0000.zkey"
    local final_zkey_file="$build_dir/${circuit_name}_final.zkey"
    local vkey_file="$build_dir/${circuit_name}_vkey.json"
    # Capitalize first letter of circuit name and each word after underscore
    # e.g., "absorb_send" -> "AbsorbSend"
    local capitalized_name=$(echo "$circuit_name" | sed 's/_\([a-z]\)/_\U\1/g' | sed 's/^\([a-z]\)/\U\1/' | sed 's/_//g')
    local verifier_file="$CONTRACTS_DIR/src/Verifiers/Verifier${capitalized_name}.sol"
    
    echo "=========================================="
    echo "Processing circuit: $circuit_name"
    echo "=========================================="
    
    # Step 1: Compile circuit (skip if already compiled)
    if [ -f "$r1cs_file" ] && [ -f "$wasm_file" ]; then
        echo "Step 1: Circuit already compiled, skipping..."
    else
        echo "Step 1: Compiling circuit..."
        if [ ! -f "$circuit_file" ]; then
            echo "Error: Circuit file not found: $circuit_file"
            exit 1
        fi
        
        mkdir -p "$build_dir"
        # Use O2 optimization with multiple rounds for maximum constraint reduction
        # O2: Full constraint simplification
        # O2round: Multiple rounds of simplification (default is 1, we use 3 for better optimization)
        circom "$circuit_file" --r1cs --wasm --sym --c --O2 --O2round 3 -o "$build_dir" || {
            echo "Error: Failed to compile circuit $circuit_name"
            exit 1
        }
        
        if [ ! -f "$r1cs_file" ]; then
            echo "Error: R1CS file not generated: $r1cs_file"
            exit 1
        fi
        
        echo "✓ Circuit compiled successfully"
    fi
    
    # Check circuit size
    local circuit_size=$(get_circuit_size "$r1cs_file")
    echo "  Circuit size: $circuit_size constraints"
    
    # Set power based on circuit: absorb_send uses power 18, all others use power 17
    if [ "$circuit_name" = "absorb_send" ]; then
        POTAU_POWER=18
        echo "  Using POTAU_POWER=18 (2^18 = $((2 ** 18))) for absorb_send circuit"
    else
        POTAU_POWER=17
        echo "  Using POTAU_POWER=17 (2^17 = $((2 ** 17))) for $circuit_name circuit"
    fi
    
    # If building a specific circuit, remove old zkey/vkey files to force rebuild
    if [ "$is_single_circuit" = "true" ] && [ -f "$final_zkey_file" ]; then
        echo "Removing old zkey/vkey files for $circuit_name to force rebuild..."
        rm -f "$zkey_file" "$final_zkey_file" "$vkey_file"
    fi
    
    # Setup powers of tau with the calculated power
    # setup_powers_of_tau will use POTAU_POWER which we just calculated
    setup_powers_of_tau
    
    # Step 2: Generate zkey (proving key) - skip if final zkey exists
    if [ -f "$final_zkey_file" ]; then
        echo "Step 2-3: Proving key already exists, skipping..."
    else
        echo "Step 2: Generating proving key..."
        # Estimate time based on circuit size
        if [ "$circuit_size" -gt 40000 ]; then
            echo "  ⏳ This will take ~10-15 minutes (circuit has $circuit_size constraints)..."
        elif [ "$circuit_size" -gt 30000 ]; then
            echo "  ⏳ This will take ~5-10 minutes (circuit has $circuit_size constraints)..."
        else
            echo "  ⏳ This will take ~1-3 minutes (circuit has $circuit_size constraints)..."
        fi
        
        # Run snarkjs in background and show progress indicator
        echo "  Starting setup (this may take a while, showing progress dots)..."
        (
            snarkjs groth16 setup "$r1cs_file" "$POTAU_FILE" "$zkey_file" -v > /tmp/snarkjs_${circuit_name}.log 2>&1
            echo $? > /tmp/snarkjs_${circuit_name}.exitcode
        ) &
        local setup_pid=$!
        
        # Show progress indicator while process runs
        local counter=0
        while kill -0 $setup_pid 2>/dev/null; do
            sleep 3
            counter=$((counter + 1))
            # Show a dot every 3 seconds, and CPU usage every 30 seconds
            if [ $((counter % 10)) -eq 0 ]; then
                # Check CPU usage
                local cpu_usage=$(ps -p $setup_pid -o %cpu= 2>/dev/null | tr -d ' ' || echo "0")
                echo "  [${counter}s] Process running... (CPU: ${cpu_usage}%)"
            else
                echo -n "."
            fi
        done
        echo ""  # New line after dots
        
        # Wait for process and check exit code
        wait $setup_pid
        local exit_code=$(cat /tmp/snarkjs_${circuit_name}.exitcode 2>/dev/null || echo "1")
        rm -f /tmp/snarkjs_${circuit_name}.exitcode
        
        if [ "$exit_code" = "0" ]; then
            echo "✓ Proving key generated"
        else
            echo "Error: Failed to generate zkey for $circuit_name"
            echo "Check /tmp/snarkjs_${circuit_name}.log for details"
            tail -30 /tmp/snarkjs_${circuit_name}.log 2>/dev/null || true
            exit 1
        fi
        
        # Step 3: Contribute to zkey (add randomness)
        echo "Step 3: Contributing to zkey..."
        # Generate random entropy automatically - this makes it non-interactive
        local entropy=$(openssl rand -hex 32)
        echo "Contributing to zkey with random entropy (non-interactive)..."
        echo "$entropy" | snarkjs zkey contribute "$zkey_file" "$final_zkey_file" --name="Contributor" -v || {
            echo "Error: Failed to contribute to zkey"
            exit 1
        }
        
        echo "✓ Zkey contribution completed"
    fi
    
    # Step 4: Export verification key (always regenerate)
    echo "Step 4: Exporting verification key..."
    snarkjs zkey export verificationkey "$final_zkey_file" "$vkey_file" || {
        echo "Error: Failed to export verification key"
        exit 1
    }
    
    echo "✓ Verification key exported"
    
    # Step 5: Generate Solidity verifier (always regenerate)
    echo "Step 5: Generating Solidity verifier..."
    # Write to build dir first so we know snarkjs wrote the file (it may ignore full path on some systems)
    local verifier_in_build="$build_dir/Verifier${capitalized_name}.sol"
    snarkjs zkey export solidityverifier "$final_zkey_file" "$verifier_in_build" || {
        echo "Error: Failed to generate Solidity verifier"
        exit 1
    }
    
    # Update verifier contract name to match expected format
    # snarkjs generates "Verifier" but we want "Verifier{CircuitName}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/contract Verifier/contract Verifier${capitalized_name}/g" "$verifier_in_build"
    else
        sed -i "s/contract Verifier/contract Verifier${capitalized_name}/g" "$verifier_in_build"
    fi
    
    # Copy to contracts so Solidity tests use the verifier from this build
    mkdir -p "$CONTRACTS_DIR/src/Verifiers"
    cp "$verifier_in_build" "$verifier_file"
    
    echo "✓ Solidity verifier generated: $verifier_file"
    echo "Successfully processed $circuit_name"
    echo ""
}

# Main execution
echo "=========================================="
echo "Building Circom2 Verifiers"
echo "=========================================="
echo ""

# Ensure we're in the circom directory
cd "$CIRCOM_DIR"

# Build required libraries first
echo "Building required libraries..."
if [ ! -f "lib/poseidon/poseidon2.circom" ]; then
    echo "Generating Poseidon2 library..."
    npm run build:poseidon2 || {
        echo "Error: Failed to build Poseidon2"
        exit 1
    }
fi

if [ ! -f "lib/lean-imt-verify/lean_imt_verify.circom" ]; then
    echo "Generating Lean-IMT library..."
    npm run build:lean-imt || {
        echo "Error: Failed to build Lean-IMT"
        exit 1
    }
fi

echo "✓ Libraries ready"
echo ""

# Process each circuit
# Note: setup_powers_of_tau will be called inside process_circuit after calculating required power
echo "Processing ${#circuits[@]} circuits: ${circuits[*]}"
echo ""

# Determine if we're building a single circuit
is_single_circuit="false"
if [ $# -gt 0 ]; then
    is_single_circuit="true"
fi

for circuit in "${circuits[@]}"; do
    process_circuit "$circuit" "$is_single_circuit"
done

echo "=========================================="
echo "All verifiers generated successfully!"
echo "Verifiers saved to: $CONTRACTS_DIR/src/Verifiers/"
echo "=========================================="
