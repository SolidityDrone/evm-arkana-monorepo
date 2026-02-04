/**
 * Buffer polyfill utilities for browser compatibility
 * Required for @aztec/bb.js and cryptographic operations
 */

/**
 * Polyfill for Buffer.writeBigUInt64BE if it doesn't exist
 * This is needed because the buffer package v6.0.3 doesn't include BigInt write methods
 */
export function polyfillBufferBigIntMethods(Buffer: typeof globalThis.Buffer) {
    if (!Buffer.prototype.writeBigUInt64BE) {
        Buffer.prototype.writeBigUInt64BE = function (value: bigint, offset: number = 0): number {
            // Write bigint as 64-bit big-endian using DataView
            const view = new DataView(new ArrayBuffer(8));
            view.setBigUint64(0, value, false); // false = big-endian
            const bytes = new Uint8Array(view.buffer);
            // Copy bytes into this Buffer
            for (let i = 0; i < 8; i++) {
                this[offset + i] = bytes[i];
            }
            return offset + 8;
        };
    }

    if (!Buffer.prototype.writeBigUInt64LE) {
        Buffer.prototype.writeBigUInt64LE = function (value: bigint, offset: number = 0): number {
            // Write bigint as 64-bit little-endian using DataView
            const view = new DataView(new ArrayBuffer(8));
            view.setBigUint64(0, value, true); // true = little-endian
            const bytes = new Uint8Array(view.buffer);
            // Copy bytes into this Buffer
            for (let i = 0; i < 8; i++) {
                this[offset + i] = bytes[i];
            }
            return offset + 8;
        };
    }

    if (!Buffer.prototype.readBigUInt64BE) {
        Buffer.prototype.readBigUInt64BE = function (offset: number = 0): bigint {
            // Create a view over this Buffer's underlying buffer
            const view = new DataView(
                this.buffer || this,
                this.byteOffset !== undefined ? this.byteOffset + offset : offset,
                8
            );
            return view.getBigUint64(0, false); // false = big-endian
        };
    }

    if (!Buffer.prototype.readBigUInt64LE) {
        Buffer.prototype.readBigUInt64LE = function (offset: number = 0): bigint {
            // Create a view over this Buffer's underlying buffer
            const view = new DataView(
                this.buffer || this,
                this.byteOffset !== undefined ? this.byteOffset + offset : offset,
                8
            );
            return view.getBigUint64(0, true); // true = little-endian
        };
    }
}

/**
 * Initialize Buffer polyfill if needed
 * Waits for Buffer to be available with retries
 */
export async function ensureBufferPolyfill(maxRetries = 20, delay = 200): Promise<void> {
    if (typeof window === 'undefined') {
        return; // Server-side, skip
    }

    // If Buffer is already available and has the required methods, return immediately
    if (globalThis.Buffer &&
        typeof globalThis.Buffer.from === 'function' &&
        typeof globalThis.Buffer.prototype.writeBigUInt64BE === 'function') {
        return;
    }

    // Try to load Buffer immediately
    try {
        const { Buffer } = await import('buffer');
        globalThis.Buffer = Buffer;
        // @ts-ignore
        window.Buffer = Buffer;
        if (typeof global !== 'undefined') {
            // @ts-ignore
            global.Buffer = Buffer;
        }

        // Polyfill BigInt methods if they don't exist
        polyfillBufferBigIntMethods(Buffer);

        // Verify it has the required methods
        if (typeof Buffer.from === 'function' &&
            typeof Buffer.prototype.writeBigUInt64BE === 'function') {
            return;
        }
    } catch (error) {
        console.error('Failed to import buffer:', error);
    }

    // Wait and retry if BufferInit component is still loading it
    for (let i = 0; i < maxRetries; i++) {
        if (globalThis.Buffer &&
            typeof globalThis.Buffer.from === 'function' &&
            typeof globalThis.Buffer.prototype.writeBigUInt64BE === 'function') {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Final attempt to load
    if (!globalThis.Buffer ||
        typeof globalThis.Buffer.from !== 'function' ||
        typeof globalThis.Buffer.prototype.writeBigUInt64BE !== 'function') {
        try {
            const { Buffer } = await import('buffer');
            globalThis.Buffer = Buffer;
            // @ts-ignore
            window.Buffer = Buffer;
            if (typeof global !== 'undefined') {
                // @ts-ignore
                global.Buffer = Buffer;
            }
            // Polyfill BigInt methods if they don't exist
            polyfillBufferBigIntMethods(Buffer);

            if (typeof Buffer.from !== 'function' ||
                typeof Buffer.prototype.writeBigUInt64BE !== 'function') {
                throw new Error('Buffer polyfill loaded but missing required methods (writeBigUInt64BE)');
            }
        } catch (error) {
            throw new Error('Failed to load Buffer polyfill: ' + (error as Error).message);
        }
    }
}

