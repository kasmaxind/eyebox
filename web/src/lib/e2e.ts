/**
 * Client-side E2E encryption for EyeBox private videos.
 * Content keys never leave the browser in plaintext.
 * Uses Web Crypto: ECDH P-256 for key exchange + AES-GCM for content.
 */

const TEXT = new TextEncoder();
const TEXT_DEC = new TextDecoder();

function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  bytes.forEach((b) => { s += String.fromCharCode(b); });
  return btoa(s);
}

function b64ToBuf(b64: string): Uint8Array<ArrayBuffer> {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function deriveWrappingKey(password: string, saltB64: string): Promise<CryptoKey> {
  const salt = b64ToBuf(saltB64);
  const base = await crypto.subtle.importKey('raw', TEXT.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function setupE2EKeys(password: string): Promise<{
  publicKey: string;
  encryptedPrivateKey: string;
  salt: string;
}> {
  const pair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits'],
  );
  const pubRaw = await crypto.subtle.exportKey('spki', pair.publicKey);
  const privRaw = await crypto.subtle.exportKey('pkcs8', pair.privateKey);
  const salt = bufToB64(crypto.getRandomValues(new Uint8Array(16)));
  const wrapKey = await deriveWrappingKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wrapKey, privRaw);
  const packed = new Uint8Array(iv.length + cipher.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(cipher), iv.length);
  return {
    publicKey: bufToB64(pubRaw),
    encryptedPrivateKey: bufToB64(packed),
    salt,
  };
}

export async function unlockPrivateKey(
  password: string,
  encryptedPrivateKey: string,
  salt: string,
): Promise<CryptoKey> {
  const wrapKey = await deriveWrappingKey(password, salt);
  const packed = b64ToBuf(encryptedPrivateKey);
  const iv = packed.slice(0, 12);
  const data = packed.slice(12);
  const privRaw = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, wrapKey, data);
  return crypto.subtle.importKey('pkcs8', privRaw, { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveKey', 'deriveBits']);
}

export async function importPublicKey(publicKeyB64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'spki',
    b64ToBuf(publicKeyB64),
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    [],
  );
}

async function deriveSharedAes(privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: publicKey },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'],
  );
}

export async function generateContentKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function encryptFile(file: Blob, contentKey: CryptoKey): Promise<{
  ciphertext: Blob;
  iv: string;
}> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = await file.arrayBuffer();
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, contentKey, plain);
  return { ciphertext: new Blob([cipher], { type: 'application/octet-stream' }), iv: bufToB64(iv) };
}

export async function decryptBlob(ciphertext: ArrayBuffer, contentKey: CryptoKey, ivB64: string): Promise<Blob> {
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBuf(ivB64) },
    contentKey,
    ciphertext,
  );
  return new Blob([plain], { type: 'video/mp4' });
}

/** Wrap content key for storage (encrypted to owner's public key via ephemeral ECDH). */
export async function wrapContentKeyForOwner(
  contentKey: CryptoKey,
  ownerPublicKeyB64: string,
): Promise<string> {
  const ownerPub = await importPublicKey(ownerPublicKeyB64);
  const eph = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits']);
  const shared = await deriveSharedAes(eph.privateKey, ownerPub);
  const raw = await crypto.subtle.exportKey('raw', contentKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrapped = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, shared, raw);
  const ephPub = await crypto.subtle.exportKey('spki', eph.publicKey);
  return JSON.stringify({
    ephPub: bufToB64(ephPub),
    iv: bufToB64(iv),
    wrapped: bufToB64(wrapped),
  });
}

export async function unwrapContentKey(
  wrappedJson: string,
  privateKey: CryptoKey,
): Promise<CryptoKey> {
  const payload = JSON.parse(wrappedJson) as { ephPub: string; iv: string; wrapped: string };
  const ephPub = await importPublicKey(payload.ephPub);
  const shared = await deriveSharedAes(privateKey, ephPub);
  const raw = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBuf(payload.iv) },
    shared,
    b64ToBuf(payload.wrapped),
  );
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function wrapContentKeyForRecipient(
  contentKey: CryptoKey,
  recipientPublicKeyB64: string,
): Promise<string> {
  return wrapContentKeyForOwner(contentKey, recipientPublicKeyB64);
}

export function hasSubtleCrypto() {
  return typeof crypto !== 'undefined' && !!crypto.subtle;
}

export { bufToB64, b64ToBuf, TEXT_DEC };
