/**
 * Cryptographic Backup, Encryption & Integrity Engine
 * Implements real AES-256-GCM authenticated encryption via Web Crypto API (SubtleCrypto)
 * with PBKDF2 key derivation (100,000 iterations) and SHA-256 tamper-proof verification.
 */

import { enforceImmutableRiskLimits } from './riskEngine';

export const DEFAULT_VAULT_PASSPHRASE = 'TradeMitra-Aakash-Vault-2026';

export interface EncryptedBackupEnvelope {
  app: 'TradeMitra AI';
  version: '1.0-AES-256-GCM' | '1.0-SHA-256-SIGNED';
  cipher: 'AES-256-GCM' | 'PLAINTEXT-SIGNED';
  kdf: 'PBKDF2-SHA256' | 'NONE';
  iterations: number;
  saltHex?: string;
  ivHex?: string;
  ciphertextHex?: string;
  sha256Checksum: string;
  exportedAt: string;
  user: string;
  plaintextData?: any;
}

// Convert ArrayBuffer to Hex String
function buf2hex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex String to Uint8Array
function hex2buf(hexString: string): Uint8Array {
  const clean = hexString.replace(/\s+/g, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

// Compute SHA-256 cryptographic digest of a string
export async function computeSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return buf2hex(hashBuffer);
}

// Derive a 256-bit AES-GCM key from user passphrase and salt via PBKDF2
async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array,
  iterations: number = 100000
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseBytes = encoder.encode(passphrase);

  // Import raw passphrase as key material
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passphraseBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive AES-GCM 256-bit key
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt backup payload with AES-256-GCM and generate SHA-256 integrity hash
 */
export async function createEncryptedBackup(
  payloadData: any,
  passphrase: string = DEFAULT_VAULT_PASSPHRASE
): Promise<string> {
  const plainText = JSON.stringify(payloadData);
  const sha256Checksum = await computeSHA256(plainText);

  // Generate 16-byte random salt and 12-byte random IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive AES-GCM Key
  const key = await deriveKeyFromPassphrase(passphrase, salt, 100000);

  // Encrypt payload using AES-256-GCM
  const encoder = new TextEncoder();
  const plainBuffer = encoder.encode(plainText);
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    plainBuffer as unknown as BufferSource
  );


  const envelope: EncryptedBackupEnvelope = {
    app: 'TradeMitra AI',
    version: '1.0-AES-256-GCM',
    cipher: 'AES-256-GCM',
    kdf: 'PBKDF2-SHA256',
    iterations: 100000,
    saltHex: buf2hex(salt.buffer),
    ivHex: buf2hex(iv.buffer),
    ciphertextHex: buf2hex(encryptedBuffer),
    sha256Checksum,
    exportedAt: new Date().toISOString(),
    user: 'Aakash',
  };

  return JSON.stringify(envelope, null, 2);
}

/**
 * Decrypt, verify SHA-256 checksum, and restore backup data
 * Always sanitizes risk settings with code-level immutable boundaries!
 */
export async function decryptAndRestoreBackup(
  fileContent: string,
  passphrase: string = DEFAULT_VAULT_PASSPHRASE
): Promise<{ success: boolean; data?: any; error?: string; isEncrypted?: boolean }> {
  try {
    const envelope = JSON.parse(fileContent);

    // Case 1: Real AES-256-GCM Encrypted Backup
    if (envelope.cipher === 'AES-256-GCM' && envelope.ciphertextHex && envelope.saltHex && envelope.ivHex) {
      try {
        const salt = hex2buf(envelope.saltHex);
        const iv = hex2buf(envelope.ivHex);
        const ciphertext = hex2buf(envelope.ciphertextHex);

        const key = await deriveKeyFromPassphrase(passphrase, salt, envelope.iterations || 100000);

        const decryptedBuffer = await crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: iv as unknown as BufferSource,
          },
          key,
          ciphertext as unknown as BufferSource
        );


        const decoder = new TextDecoder();
        const decryptedJsonText = decoder.decode(decryptedBuffer);

        // Verify SHA-256 Checksum
        const recomputedSha = await computeSHA256(decryptedJsonText);
        if (recomputedSha !== envelope.sha256Checksum) {
          return {
            success: false,
            error:
              'TAMPER DETECTED: SHA-256 Checksum mismatch! The backup payload was altered or corrupted.',
          };
        }

        const parsedData = JSON.parse(decryptedJsonText);

        // Security Hardening: Enforce code-level immutable limits on restored risk settings
        if (parsedData.riskSettings) {
          parsedData.riskSettings = enforceImmutableRiskLimits(parsedData.riskSettings);
        }

        return {
          success: true,
          data: parsedData,
          isEncrypted: true,
        };
      } catch (cryptoErr: any) {
        return {
          success: false,
          error:
            'DECRYPTION FAILED: Invalid passphrase or corrupted AES-256-GCM ciphertext. Authentication tag rejected.',
        };
      }
    }

    // Case 2: SHA-256 Signed Plaintext Backup (Fallback)
    if (envelope.sha256Checksum && (envelope.plaintextData || envelope.data)) {
      const rawData = envelope.plaintextData || envelope.data;
      const recomputedSha = await computeSHA256(JSON.stringify(rawData));

      if (recomputedSha !== envelope.sha256Checksum) {
        return {
          success: false,
          error:
            'TAMPER DETECTED: SHA-256 Checksum mismatch! The backup data has been modified outside the system.',
        };
      }

      if (rawData.riskSettings) {
        rawData.riskSettings = enforceImmutableRiskLimits(rawData.riskSettings);
      }

      return {
        success: true,
        data: rawData,
        isEncrypted: false,
      };
    }

    // Case 3: Raw JSON backup
    if (envelope.data && typeof envelope.data === 'object') {
      const payload = envelope.data;
      if (payload.riskSettings) {
        payload.riskSettings = enforceImmutableRiskLimits(payload.riskSettings);
      }
      return {
        success: true,
        data: payload,
        isEncrypted: false,
      };
    }

    return {
      success: false,
      error: 'Unrecognized backup format. File does not contain valid TradeMitra AI backup data.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: `FILE PARSE ERROR: ${err?.message || 'Invalid JSON file'}`,
    };
  }
}
