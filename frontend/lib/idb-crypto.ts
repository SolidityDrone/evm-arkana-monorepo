'use client';

/**
 * AES-GCM-256 encryption helpers for IndexedDB at-rest protection.
 *
 * Key sources (in priority order):
 *  1. Wallet users  — HKDF-SHA256(sha256(wallet_signature), "arkana-idb-enc-v1")
 *     Called from AccountProvider when the signature is obtained/restored.
 *     Key held in memory only (not stored anywhere), re-derived each session from
 *     the signature already in sessionStorage.
 *
 *  2. Signer mode   — random AES-256 key stored in localStorage as `arkana_device_key`.
 *     Called from ActiveProfileProvider.enterSignerMode().
 *     Binds the IDB ciphertext to this specific browser instance; copying the IDB files
 *     to another machine without the localStorage key leaves only opaque ciphertext.
 *
 * Encrypted records: base64( 12-byte IV || AES-GCM ciphertext )
 * If the key is not yet set, encrypt/decrypt are no-ops (plaintext fallback) so the
 * app remains usable during the brief window before key derivation completes.
 */

const DEVICE_KEY_LS = 'arkana_device_key';
const HKDF_SALT = new TextEncoder().encode('arkana-idb-enc-v1');
const HKDF_INFO = new TextEncoder().encode('aes-gcm-256');

let _key: CryptoKey | null = null;

// ── Key management ────────────────────────────────────────────────────────

export function setIdbKey(key: CryptoKey): void {
    _key = key;
}

export function getIdbKey(): CryptoKey | null {
    return _key;
}

export function isIdbKeyReady(): boolean {
    return _key !== null;
}

/**
 * Wallet mode: derive AES-GCM-256 key from wallet signature via HKDF-SHA256.
 * The signature is the raw hex string from MetaMask/wallet sign.
 */
export async function deriveKeyFromSignature(signature: string): Promise<CryptoKey> {
    const sigHex = signature.startsWith('0x') ? signature.slice(2) : signature;
    const sigBytes = hexToBytes(sigHex);
    const sigHash = await crypto.subtle.digest('SHA-256', sigBytes.buffer as ArrayBuffer);

    const keyMaterial = await crypto.subtle.importKey(
        'raw', sigHash, 'HKDF', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'HKDF', hash: 'SHA-256', salt: HKDF_SALT, info: HKDF_INFO },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Signer mode: get or create a device-bound AES-256 key persisted in localStorage.
 * On first call a new key is generated and exported to localStorage. Subsequent calls
 * on the same device restore it. Clearing site data removes the key.
 */
export async function getOrCreateDeviceKey(): Promise<CryptoKey> {
    try {
        const stored = localStorage.getItem(DEVICE_KEY_LS);
        if (stored) {
            const keyBytes = hexToBytes(stored);
            return crypto.subtle.importKey(
                'raw', keyBytes.buffer as ArrayBuffer,
                { name: 'AES-GCM' },
                false,
                ['encrypt', 'decrypt']
            );
        }
    } catch { /* localStorage unavailable — fall through to generate */ }

    const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
    const exported = await crypto.subtle.exportKey('raw', key);
    try {
        localStorage.setItem(DEVICE_KEY_LS, bytesToHex(new Uint8Array(exported)));
    } catch { /* ok — key stays in memory only */ }
    return key;
}

// ── Encrypt / Decrypt ─────────────────────────────────────────────────────

/**
 * Encrypt a plaintext string with the current session key.
 * Returns base64(12-byte IV || AES-GCM ciphertext).
 * If no key is set, returns the plaintext unchanged (graceful degradation).
 */
export async function encryptIdb(plaintext: string): Promise<string> {
    if (!_key) return plaintext;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, _key, encoded);
    const out = new Uint8Array(12 + ciphertext.byteLength);
    out.set(iv, 0);
    out.set(new Uint8Array(ciphertext), 12);
    return btoa(String.fromCharCode(...out));
}

/**
 * Decrypt a base64(IV || ciphertext) string produced by encryptIdb.
 * Returns null if: no key is set, decryption fails, or input is not valid base64.
 * A null return signals the caller to fall back to treating the stored value as
 * legacy plaintext JSON.
 */
export async function decryptIdb(ciphertext: string): Promise<string | null> {
    if (!_key) return null;
    try {
        const bytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
        if (bytes.length < 13) return null;
        const iv = bytes.slice(0, 12);
        const data = bytes.slice(12);
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, _key, data);
        return new TextDecoder().decode(decrypted);
    } catch {
        return null;
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
