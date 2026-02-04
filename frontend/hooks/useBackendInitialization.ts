import { useState, useRef, useCallback } from 'react';
import { Noir } from '@noir-lang/noir_js';
import { CachedUltraHonkBackend } from '@/lib/cached-ultra-honk-backend';

interface CircuitData {
  bytecode: Uint8Array | string;
  abi: any;
}

interface UseBackendInitializationOptions {
  circuit: CircuitData | { bytecode: string | Uint8Array; abi: any };
  threads?: number;
}

interface UseBackendInitializationReturn {
  backend: CachedUltraHonkBackend | null;
  noir: Noir | null;
  isInitialized: boolean;
  isInitializing: boolean;
  initializationTime: number | null;
  initializeBackend: () => Promise<void>;
}

/**
 * Shared hook for initializing Noir backend and circuit
 * This logic is duplicated across multiple pages - extracted here for reuse
 */
export function useBackendInitialization(
  options: UseBackendInitializationOptions
): UseBackendInitializationReturn {
  const { circuit, threads = 1 } = options;
  const backendRef = useRef<CachedUltraHonkBackend | null>(null);
  const noirRef = useRef<Noir | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationTime, setInitializationTime] = useState<number | null>(null);

  const initializeBackend = useCallback(async () => {
    if (isInitialized && backendRef.current && noirRef.current) {
      return;
    }

    const startTime = performance.now();
    setIsInitializing(true);

    try {
      // Ensure Buffer polyfill is loaded BEFORE initializing backend
      const { ensureBufferPolyfill } = await import('@/lib/zk-address');
      await ensureBufferPolyfill();

      const backendOptions = {
        threads,
      };

      // Handle both string and Uint8Array bytecode
      let bytecode: Uint8Array;
      if (typeof circuit.bytecode === 'string') {
        // If it's a base64 string, decode it
        if (!globalThis.Buffer) {
          const { Buffer } = await import('buffer');
          globalThis.Buffer = Buffer;
        }
        bytecode = Uint8Array.from(globalThis.Buffer.from(circuit.bytecode, 'base64'));
      } else {
        bytecode = circuit.bytecode;
      }

      const backend = new CachedUltraHonkBackend(bytecode, backendOptions);
      const noir = new Noir(circuit as any);

      backendRef.current = backend;
      noirRef.current = noir;

      const endTime = performance.now();
      const initTime = Math.round(endTime - startTime);
      setInitializationTime(initTime);
      setIsInitialized(true);

    } catch (error) {
      console.error('Failed to initialize backend:', error);
      throw error;
    } finally {
      setIsInitializing(false);
    }
  }, [isInitialized, circuit, threads]);

  return {
    backend: backendRef.current,
    noir: noirRef.current,
    isInitialized,
    isInitializing,
    initializationTime,
    initializeBackend,
  };
}

