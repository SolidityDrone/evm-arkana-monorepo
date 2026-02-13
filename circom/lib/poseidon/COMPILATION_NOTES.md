# Poseidon2 Compilation Notes

## Current Issue

Circom has limitations that prevent the current implementation from compiling:

1. **Multi-dimensional arrays in `var` declarations**: Circom doesn't support `var round_constant = [[...], [...]]` syntax
2. **Component declarations in loops**: Components must be declared upfront, not inside loops
3. **Signal declarations in loops**: Signals must be declared upfront

## Solutions

### Option 1: Flatten Constants (Recommended for now)

Flatten the round constants into a single array and access them using index calculations:
- `round_constant[r][i]` becomes `round_constant[r * 4 + i]`

### Option 2: Code Generation Script

Create a script that generates the fully unrolled version with all 64 rounds explicitly written out.

### Option 3: Use Existing Poseidon2 Implementation

Consider using an existing Circom Poseidon2 implementation if available, or wait for Circom to better support these features.

## Current Status

The circuit structure is correct but needs to be adapted to Circom's constraints. The permutation logic is sound - it just needs to be expressed in a way Circom can compile.

## Next Steps

1. Flatten the round constants array
2. Unroll or restructure the internal rounds loop
3. Test compilation
4. Compare outputs with Noir implementation





