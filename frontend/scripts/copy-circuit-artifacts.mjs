#!/usr/bin/env node
/**
 * Copy circuit WASM and zkey from lib/circuits to public/circuits so the app can load them.
 * Run: pnpm run copy-circuits (or node scripts/copy-circuit-artifacts.mjs)
 */
import { cp, readdir, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LIB = join(ROOT, 'lib', 'circuits');
const PUBLIC = join(ROOT, 'public', 'circuits');

const CIRCUITS = ['entry', 'deposit', 'withdraw', 'send'];

async function copyCircuits() {
  for (const name of CIRCUITS) {
    const libDir = join(LIB, name);
    const publicDir = join(PUBLIC, name);
    const wasmSrc = join(libDir, `${name}_js`, `${name}.wasm`);
    const wasmDst = join(publicDir, `${name}.wasm`);

    await mkdir(publicDir, { recursive: true });

    try {
      await cp(wasmSrc, wasmDst, { force: true });
      console.log(`Copied ${name}.wasm`);
    } catch (e) {
      console.warn(`Skip ${name}.wasm: ${e.message}`);
    }

    const zkeyFinal = join(libDir, `${name}_final.zkey`);
    try {
      await cp(zkeyFinal, join(publicDir, `${name}_final.zkey`), { force: true });
      console.log(`Copied ${name}_final.zkey`);
    } catch {
      const entries = await readdir(libDir, { withFileTypes: true }).catch(() => []);
      const zkey = entries.find((e) => e.isFile() && e.name.startsWith(name) && e.name.endsWith('.zkey'));
      if (zkey) {
        await cp(join(libDir, zkey.name), join(publicDir, `${name}_final.zkey`), { force: true });
        console.log(`Copied ${zkey.name} as ${name}_final.zkey`);
      } else {
        console.warn(`No zkey found for ${name} in ${libDir}`);
      }
    }
  }
}

copyCircuits().catch((e) => {
  console.error(e);
  process.exit(1);
});
