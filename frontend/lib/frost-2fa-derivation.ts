/**
 * Deterministic share derivation methods for FROST 2FA.
 * Instead of storing the scalar share s2, derive it deterministically from:
 * - Passkey (WebAuthn credential)
 * - Seed phrase (BIP32/BIP44)
 * - EOA signature (wallet signature)
 *
 * This makes the share portable and eliminates the need for browser storage.
 */

// Baby Jubjub subgroup order
// Baby Jubjub prime subgroup order (order of base point B8)
const SUBGROUP_ORDER = BigInt('2736030358979909402780800718157159386076813972158567259200215660948447373041');

// Domain-specific salt for Arkana 2FA (prevents cross-domain key reuse)
const ARKANA_2FA_SALT = 'arkana-2fa-v1';

export type DerivationMethod = 'passkey' | 'seedphrase' | 'eoa';

export interface PasskeyCredential {
  id: string; // Base64URL credential ID
  publicKey: CryptoKey; // WebAuthn public key
}

export interface SeedPhraseConfig {
  mnemonic: string;
  accountIndex?: number; // BIP44 account index (default: 0)
  purpose?: string; // Additional purpose string (default: 'arkana-2fa')
}

export interface EOASignatureConfig {
  address: string; // EOA address
  signature: string; // Signature of deterministic message
}

// ── Helper: Derive scalar from bytes ────────────────────────────────────────

function bytesToScalar(bytes: Uint8Array): bigint {
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const scalar = BigInt('0x' + hex);
  return scalar % SUBGROUP_ORDER;
}

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', data));
}

// ── Passkey Derivation ─────────────────────────────────────────────────────

/**
 * Create a WebAuthn credential for deterministic share derivation.
 * The credential ID will be used to derive the scalar share.
 */
export async function createPasskeyCredential(
  userId: string, // User identifier (e.g., zkAddress)
  userName: string, // Display name
): Promise<PasskeyCredential> {
  if (!window.PublicKeyCredential) {
    throw new Error('WebAuthn/Passkeys not supported in this browser');
  }

  // Create credential with deterministic challenge (can be empty for our use case)
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge); // Random challenge for credential creation

  const publicKeyCredential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: {
        name: 'Arkana',
        id: window.location.hostname,
      },
      user: {
        id: stringToBytes(userId),
        name: userName,
        displayName: userName,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Prefer platform authenticator (passkey)
        requireResidentKey: true,
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'none',
    },
  }) as PublicKeyCredential;

  if (!publicKeyCredential) {
    throw new Error('Failed to create passkey credential');
  }

  return {
    id: publicKeyCredential.id,
    publicKey: (publicKeyCredential.response as any).getPublicKey(),
  };
}

/**
 * Derive scalar share s2 from passkey credential ID.
 * Deterministic: same credential ID always produces same scalar.
 */
export function base64UrlToBytes(base64url: string): Uint8Array {
  // Convert base64url to base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  // Decode
  const binary = atob(base64);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

export async function deriveScalarFromPasskey(
  credentialId: string,
  domainSalt: string = ARKANA_2FA_SALT,
): Promise<bigint> {
  // Combine credential ID + domain salt → SHA256 → scalar
  const idBytes = base64UrlToBytes(credentialId);
  const saltBytes = stringToBytes(domainSalt);
  const combined = new Uint8Array(idBytes.length + saltBytes.length);
  combined.set(idBytes, 0);
  combined.set(saltBytes, idBytes.length);
  const hash = await sha256(combined);
  return bytesToScalar(hash);
}

/**
 * Authenticate with passkey and derive scalar share.
 * This should be called each time we need to sign (not stored).
 */
export async function authenticateAndDeriveFromPasskey(
  credentialId: string,
  challenge: Uint8Array, // Challenge for this signing session
): Promise<{ scalar: bigint; assertion: PublicKeyCredential }> {
  if (!window.PublicKeyCredential) {
    throw new Error('WebAuthn/Passkeys not supported in this browser');
  }

  // Get assertion (user authenticates with passkey)
  const credentialIdBytes = base64UrlToBytes(credentialId);
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{
        id: credentialIdBytes,
        type: 'public-key',
      }],
      userVerification: 'required',
      timeout: 60000,
    },
  }) as PublicKeyCredential;

  if (!assertion) {
    throw new Error('Passkey authentication failed');
  }

  // Derive scalar from credential ID (deterministic)
  const scalar = await deriveScalarFromPasskey(credentialId);
  return { scalar, assertion };
}

// ── Seed Phrase Derivation ────────────────────────────────────────────────

/**
 * Derive scalar share s2 from seed phrase using BIP32/BIP44 style derivation.
 * Deterministic: same mnemonic + account index produces same scalar.
 */
export async function deriveScalarFromSeedPhrase(
  config: SeedPhraseConfig,
): Promise<bigint> {
  // For now, use a simple approach: hash(mnemonic + accountIndex + purpose)
  // In production, you'd use proper BIP32/BIP44 derivation
  const accountIndex = config.accountIndex ?? 0;
  const purpose = config.purpose ?? 'arkana-2fa';
  const combined = `${config.mnemonic}:${accountIndex}:${purpose}:${ARKANA_2FA_SALT}`;
  const hash = await sha256(stringToBytes(combined));
  return bytesToScalar(hash);
}

// ── EOA Signature Derivation ──────────────────────────────────────────────

/**
 * Derive scalar share s2 from EOA signature.
 * User signs a deterministic message, we hash the signature → scalar.
 */
export async function deriveScalarFromEOASignature(
  address: string,
  signature: string,
  message: string = ARKANA_2FA_SALT,
): Promise<bigint> {
  // Combine address + signature + message → SHA256 → scalar
  const combined = `${address}:${signature}:${message}`;
  const hash = await sha256(stringToBytes(combined));
  return bytesToScalar(hash);
}

/**
 * Request EOA signature for share derivation.
 * Returns the signature that can be used to derive the scalar.
 */
export async function requestEOASignatureForDerivation(
  signMessageAsync: (params: { message: string }) => Promise<string>,
  address: string,
): Promise<string> {
  const message = `Arkana 2FA Share Derivation\n\nAddress: ${address}\nPurpose: ${ARKANA_2FA_SALT}\n\nThis signature is used to derive your 2FA signing share.`;
  return signMessageAsync({ message });
}

// ── Unified Derivation Interface ────────────────────────────────────────

export type DerivationConfig =
  | {
      method: 'passkey';
      credentialId: string;
      challenge?: Uint8Array; // For signing, not DKG
    }
  | {
      method: 'seedphrase';
      mnemonic: string;
      accountIndex?: number;
    }
  | {
      method: 'eoa';
      address: string;
      signature: string;
    };

/**
 * Derive scalar share from any supported method.
 */
export async function deriveScalarShare(config: DerivationConfig): Promise<bigint> {
  switch (config.method) {
    case 'passkey':
      if (config.challenge) {
        // Authenticate and derive (for signing)
        const { scalar } = await authenticateAndDeriveFromPasskey(config.credentialId, config.challenge);
        return scalar;
      } else {
        // Just derive (for DKG, no auth needed)
        return deriveScalarFromPasskey(config.credentialId);
      }
    case 'seedphrase':
      return deriveScalarFromSeedPhrase({
        mnemonic: config.mnemonic,
        accountIndex: config.accountIndex,
      });
    case 'eoa':
      return deriveScalarFromEOASignature(config.address, config.signature);
    default:
      throw new Error(`Unknown derivation method: ${(config as any).method}`);
  }
}
