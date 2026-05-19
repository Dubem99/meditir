import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { logger } from './logger';

// Application-level encryption for PHI columns. AES-256-GCM with a random
// 96-bit IV per value. Ciphertext is stored as a self-describing envelope:
//
//   enc:v1:<base64 iv>:<base64 authTag>:<base64 ciphertext>
//
// Decryption keys off the prefix, so plaintext rows written before
// encryption was enabled pass straight through — no risky big-bang
// backfill required. New writes are always encrypted.

const PREFIX = 'enc:v1:';

let key: Buffer | null = null;
let warned = false;

const getKey = (): Buffer | null => {
  if (key) return key;
  const raw = process.env.PHI_ENCRYPTION_KEY;
  if (!raw) return null;
  const buf = Buffer.from(raw, 'hex');
  if (buf.length !== 32) {
    throw new Error('PHI_ENCRYPTION_KEY must be 64 hex chars (32 bytes for AES-256)');
  }
  key = buf;
  return key;
};

export const phiEncryptionEnabled = (): boolean => !!process.env.PHI_ENCRYPTION_KEY;

export const isEncrypted = (v: unknown): v is string =>
  typeof v === 'string' && v.startsWith(PREFIX);

export function encrypt(plain: string): string {
  const k = getKey();
  if (k === null) return plain; // encryption disabled — store as-is
  if (isEncrypted(plain)) return plain; // never double-encrypt
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', k, iv);
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${ct.toString('base64')}`;
}

export function decrypt(value: string): string {
  if (!isEncrypted(value)) return value; // legacy plaintext
  const k = getKey();
  if (k === null) {
    if (!warned) {
      warned = true;
      logger.error('[phi-crypto] encrypted value read but PHI_ENCRYPTION_KEY is not set', {
        event: 'phi_decrypt_no_key',
      });
    }
    return value;
  }
  try {
    const [, , ivB64, tagB64, ctB64] = value.split(':');
    const decipher = createDecipheriv('aes-256-gcm', k, Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(ctB64, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  } catch (err) {
    logger.error('[phi-crypto] decryption failed', {
      event: 'phi_decrypt_failed',
      err: (err as Error).message,
    });
    throw err;
  }
}

// Recursively decrypt every enveloped string in a query result, including
// nested includes — ciphertext is self-identifying so this is model-agnostic.
export function decryptDeep<T>(node: T): T {
  if (node == null) return node;
  if (typeof node === 'string') return (isEncrypted(node) ? decrypt(node) : node) as T;
  if (Array.isArray(node)) return node.map((n) => decryptDeep(n)) as T;
  if (node instanceof Date) return node;
  if (typeof node === 'object') {
    for (const k of Object.keys(node as Record<string, unknown>)) {
      (node as Record<string, unknown>)[k] = decryptDeep((node as Record<string, unknown>)[k]);
    }
  }
  return node;
}
