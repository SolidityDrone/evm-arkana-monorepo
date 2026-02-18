'use client';

/**
 * Initialize Buffer polyfill synchronously before circom/snarkjs and other crypto modules load.
 */
export function BufferInit() {
    // Initialize Buffer immediately when component mounts
    if (typeof window !== 'undefined') {
        // Use a synchronous approach if possible, otherwise async
        // We need Buffer to be available before any modules that depend on it load
        const initBuffer = async () => {
            if (!globalThis.Buffer) {
                try {
                    const { Buffer } = await import('buffer');
                    
                    // Set Buffer in all possible locations for circom/snarkjs
                    globalThis.Buffer = Buffer;
                    // @ts-ignore
                    window.Buffer = Buffer;
                    
                    // Create a global reference if needed
                    if (typeof global !== 'undefined') {
                        // @ts-ignore
                        global.Buffer = Buffer;
                    }
                    
                    // Also set on window.global for compatibility
                    // @ts-ignore
                    (window as any).global = window;
                    // @ts-ignore
                    (window as any).global.Buffer = Buffer;
                    
                    // Polyfill BigInt methods if they don't exist
                    const { polyfillBufferBigIntMethods } = await import('@/lib/buffer-polyfill');
                    polyfillBufferBigIntMethods(Buffer);

                } catch (error) {
                    console.error('❌ Failed to load Buffer polyfill:', error);
                }
            }
        };
        
        // Start initialization immediately
        initBuffer();
    }

    return null;
}

