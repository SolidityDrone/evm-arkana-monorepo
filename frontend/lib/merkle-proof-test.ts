import { LeanIMTContract } from './merkle-proof';
import { poseidon2HashAsync } from './poseidon2-hash';

// Test leaves: 0x000000..., 0x1111111..., 0x22222..., etc
const LEAVES: bigint[] = [
    BigInt('0x0000000000000000000000000000000000000000000000000000000000000000'),
    BigInt('0x1111111111111111111111111111111111111111111111111111111111111111'),
    BigInt('0x2222222222222222222222222222222222222222222222222222222222222222'),
    BigInt('0x3333333333333333333333333333333333333333333333333333333333333333'),
    BigInt('0x4444444444444444444444444444444444444444444444444444444444444444'),
    BigInt('0x5555555555555555555555555555555555555555555555555555555555555555'),
    BigInt('0x6666666666666666666666666666666666666666666666666666666666666666'),
    BigInt('0x7777777777777777777777777777777777777777777777777777777777777777'),
    BigInt('0x8888888888888888888888888888888888888888888888888888888888888888'),
    BigInt('0x9999999999999999999999999999999999999999999999999999999999999999'),
];

/**
 * Test multi-context Lean IMT
 * Builds tree, generates proofs, and verifies them
 */
export async function testMultiContextLeanIMT() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║      TYPESCRIPT: Lean IMT Multi-Context Test                ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');

    console.log('Building tree with 10 leaves...');
    console.log('Leaves:');
    LEAVES.forEach((leaf, i) => {
        console.log(`  Leaf[${i}]: 0x${leaf.toString(16).padStart(64, '0')}`);
    });
    console.log('');

    // Build tree
    const tree = new LeanIMTContract();
    await tree.buildFromLeaves(LEAVES);

    const root = tree.root;
    const depth = tree.depth;

    console.log('Tree built:');
    console.log(`  Root: 0x${root.toString(16).padStart(64, '0')}`);
    console.log(`  Depth: ${depth}`);
    console.log('');

    // Generate proofs for all leaves
    console.log('Generating proofs for all leaves...');
    const proofs: bigint[][] = [];
    for (let i = 0; i < 10; i++) {
        const proof = await tree.generateProof(i);
        proofs.push(proof.siblings);
        console.log(`  Generated proof for leaf[${i}]`);
    }
    console.log('');

    // Verify all proofs
    console.log('Verifying proofs for all leaves...');
    const { verifyProofWithDepth } = await import('./merkle-proof');
    
    for (let i = 0; i < 10; i++) {
        console.log(`  Verifying proof for leaf[${i}] (index ${i})...`);
        console.log(`    Leaf: 0x${LEAVES[i].toString(16).padStart(64, '0')}`);

        const isValid = await verifyProofWithDepth(
            LEAVES[i],
            i,
            depth,
            root,
            proofs[i].map(s => BigInt(s))
        );

        if (!isValid) {
            throw new Error(`Proof verification failed for leaf[${i}]`);
        }

        console.log('    ✅ Proof verified!');
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('TYPESCRIPT TEST RESULTS:');
    console.log(`  Root: 0x${root.toString(16).padStart(64, '0')}`);
    console.log(`  Depth: ${depth}`);
    console.log('  All 10 proofs verified successfully!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');

    // Output results for comparison
    console.log('=== OUTPUT FOR COMPARISON ===');
    console.log('ROOT:');
    console.log(`0x${root.toString(16).padStart(64, '0')}`);
    console.log('DEPTH:');
    console.log(depth.toString());
    console.log('PROOFS:');
    for (let i = 0; i < 10; i++) {
        console.log(`PROOF[${i}]:`);
        for (let j = 0; j < 32; j++) {
            const sibling = proofs[i][j] || BigInt(0);
            console.log(`  [${j}]: 0x${sibling.toString(16).padStart(64, '0')}`);
        }
    }

    return {
        root,
        depth,
        proofs,
    };
}

// Run test if called directly
if (require.main === module) {
    testMultiContextLeanIMT()
        .then(() => {
            console.log('✅ TypeScript test completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ TypeScript test failed:', error);
            process.exit(1);
        });
}

