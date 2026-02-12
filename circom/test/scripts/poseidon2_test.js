const wasm_tester = require("circom_tester").wasm;
const path = require("path");
const fs = require("fs");

describe("Poseidon2 Hash Tests", function () {
    this.timeout(100000);

    let circuit1, circuit2, circuit3;

    before(async () => {
        // Compile circuits
        circuit1 = await wasm_tester(
            path.join(__dirname, "poseidon2_hash1_test.circom")
        );
        circuit2 = await wasm_tester(
            path.join(__dirname, "poseidon2_hash2_test.circom")
        );
        circuit3 = await wasm_tester(
            path.join(__dirname, "poseidon2_hash3_test.circom")
        );
    });

    it("Poseidon2Hash1: Hash single value", async () => {
        const input = {
            in: "0x10" // 16 in decimal
        };

        const w = await circuit1.calculateWitness(input, true);
        const output = w[circuit1.symbols["main.out"].varIdx].toString();

        console.log("Poseidon2Hash1 input:", input.in);
        console.log("Poseidon2Hash1 output:", output);
        console.log("");
    });

    it("Poseidon2Hash2: Hash two values", async () => {
        const input = {
            in: ["0x10", "0x20"]
        };

        const w = await circuit2.calculateWitness(input, true);
        const output = w[circuit2.symbols["main.out"].varIdx].toString();

        console.log("Poseidon2Hash2 input:", input.in);
        console.log("Poseidon2Hash2 output:", output);
        console.log("");
    });

    it("Poseidon2Hash3: Hash three values", async () => {
        const input = {
            in: ["0x10", "0x20", "0x30"]
        };

        const w = await circuit3.calculateWitness(input, true);
        const output = w[circuit3.symbols["main.out"].varIdx].toString();

        console.log("Poseidon2Hash3 input:", input.in);
        console.log("Poseidon2Hash3 output:", output);
        console.log("");
    });

    it("Poseidon2Hash1: Test from Noir (input=0x10)", async () => {
        // This test uses the same input as the Noir test
        const input = {
            in: "0x10"
        };

        const w = await circuit1.calculateWitness(input, true);
        const output = w[circuit1.symbols["main.out"].varIdx].toString();

        console.log("Noir test input:", input.in);
        console.log("Circom output:", output);
        console.log("Compare with Noir output from test_poseidon.nr");
        console.log("");
    });

    it("Poseidon2Hash2: Test keystream generation (key + nonce)", async () => {
        // Simulating poseidon_keystream(key, nonce)
        const key = "0x1234567890abcdef";
        const nonce = "0x1"; // counter = 1

        const input = {
            in: [key, nonce]
        };

        const w = await circuit2.calculateWitness(input, true);
        const output = w[circuit2.symbols["main.out"].varIdx].toString();

        console.log("Keystream key:", key);
        console.log("Keystream nonce:", nonce);
        console.log("Keystream output:", output);
        console.log("");
    });
});

