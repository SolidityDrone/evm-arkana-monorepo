/**
 * Entry circuit witness calculator (browser-compatible).
 * Copy of public/circuits/entry/entry_js/witness_calculator.js with export default for use in circuit-poseidon.
 */
export default async function builder(code, options) {
    options = options || {};
    let wasmModule;
    try {
        wasmModule = await WebAssembly.compile(code);
    } catch (err) {
        throw new Error(err);
    }
    let errStr = "";
    let msgStr = "";
    const instance = await WebAssembly.instantiate(wasmModule, {
        runtime: {
            exceptionHandler: function (code) {
                let err = code === 1 ? "Signal not found.\n" : code === 2 ? "Too many signals set.\n" : code === 3 ? "Signal already set.\n" : code === 4 ? "Assert Failed.\n" : code === 5 ? "Not enough memory.\n" : code === 6 ? "Input signal array access exceeds the size.\n" : "Unknown error.\n";
                throw new Error(err + errStr);
            },
            printErrorMessage: function () { errStr += getMessage() + "\n"; },
            writeBufferMessage: function () {
                const msg = getMessage();
                if (msg === "\n") { console.log(msgStr); msgStr = ""; } else { if (msgStr !== "") msgStr += " "; msgStr += msg; }
            },
            showSharedRWMemory: function () { printSharedRWMemory(); }
        }
    });
    function getMessage() {
        let message = "";
        let c = instance.exports.getMessageChar();
        while (c !== 0) { message += String.fromCharCode(c); c = instance.exports.getMessageChar(); }
        return message;
    }
    function printSharedRWMemory() {
        const shared_rw_memory_size = instance.exports.getFieldNumLen32();
        const arr = new Uint32Array(shared_rw_memory_size);
        for (let j = 0; j < shared_rw_memory_size; j++) arr[shared_rw_memory_size - 1 - j] = instance.exports.readSharedRWMemory(j);
        if (msgStr !== "") msgStr += " ";
        msgStr += fromArray32(arr).toString();
    }
    const wc = new WitnessCalculator(instance, options);
    return wc;
}

class WitnessCalculator {
    constructor(instance, sanityCheck) {
        this.instance = instance;
        this.n32 = this.instance.exports.getFieldNumLen32();
        this.instance.exports.getRawPrime();
        const arr = new Uint32Array(this.n32);
        for (let i = 0; i < this.n32; i++) arr[this.n32 - 1 - i] = this.instance.exports.readSharedRWMemory(i);
        this.prime = fromArray32(arr);
        this.witnessSize = this.instance.exports.getWitnessSize();
        this.sanityCheck = sanityCheck;
    }
    async _doCalculateWitness(input_orig, sanityCheck) {
        this.instance.exports.init((this.sanityCheck || sanityCheck) ? 1 : 0);
        const input = {};
        qualify_input("", input_orig, input);
        const keys = Object.keys(input);
        let input_counter = 0;
        keys.forEach((k) => {
            const h = fnvHash(k);
            const hMSB = parseInt(h.slice(0, 8), 16);
            const hLSB = parseInt(h.slice(8, 16), 16);
            const fArr = flatArray(input[k]);
            const signalSize = this.instance.exports.getInputSignalSize(hMSB, hLSB);
            if (signalSize < 0) throw new Error("Signal " + k + " not found\n");
            if (fArr.length !== signalSize) throw new Error("Wrong length for input signal " + k + "\n");
            for (let i = 0; i < fArr.length; i++) {
                const arrFr = toArray32(normalize(fArr[i], this.prime), this.n32);
                for (let j = 0; j < this.n32; j++) this.instance.exports.writeSharedRWMemory(j, arrFr[this.n32 - 1 - j]);
                this.instance.exports.setInputSignal(hMSB, hLSB, i);
                input_counter++;
            }
        });
        if (input_counter < this.instance.exports.getInputSize()) throw new Error("Not all inputs set\n");
    }
    async calculateWitness(input, sanityCheck) {
        const w = [];
        await this._doCalculateWitness(input, sanityCheck);
        for (let i = 0; i < this.witnessSize; i++) {
            this.instance.exports.getWitness(i);
            const arr = new Uint32Array(this.n32);
            for (let j = 0; j < this.n32; j++) arr[this.n32 - 1 - j] = this.instance.exports.readSharedRWMemory(j);
            w.push(fromArray32(arr));
        }
        return w;
    }
}

function qualify_input(prefix, input, input1) {
    if (Array.isArray(input)) {
        const a = flatArray(input);
        if (a.length > 0) input1[prefix] = input;
        else input1[prefix] = input;
    } else if (typeof input === "object" && input !== null) {
        Object.keys(input).forEach((k) => {
            qualify_input(prefix === "" ? k : prefix + "." + k, input[k], input1);
        });
    } else {
        input1[prefix] = input;
    }
}

function toArray32(rem, size) {
    const res = [];
    const radix = BigInt(0x100000000);
    let r = BigInt(rem);
    while (r) { res.unshift(Number(r % radix)); r = r / radix; }
    if (size) { let i = size - res.length; while (i > 0) { res.unshift(0); i--; } }
    return res;
}

function fromArray32(arr) {
    let res = BigInt(0);
    const radix = BigInt(0x100000000);
    for (let i = 0; i < arr.length; i++) res = res * radix + BigInt(arr[i]);
    return res;
}

function flatArray(a) {
    const res = [];
    function fill(r, x) { if (Array.isArray(x)) x.forEach((e) => fill(r, e)); else r.push(x); }
    fill(res, a);
    return res;
}

function normalize(n, prime) {
    let res = BigInt(n) % prime;
    if (res < 0) res += prime;
    return res;
}

function fnvHash(str) {
    const uint64_max = BigInt(2) ** BigInt(64);
    let hash = BigInt("0xCBF29CE484222325");
    for (let i = 0; i < str.length; i++) {
        hash ^= BigInt(str.charCodeAt(i));
        hash *= BigInt("0x100000001B3");
        hash %= uint64_max;
    }
    let shash = hash.toString(16);
    shash = "0".repeat(16 - shash.length).concat(shash);
    return shash;
}
