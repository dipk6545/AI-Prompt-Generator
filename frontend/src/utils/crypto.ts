// Secure local storage utility using AES-GCM (Web Crypto API)

const PASSPHRASE = "PromptCraftClientSecureKeyObfuscation";
const SALT = new Uint8Array([80, 114, 111, 109, 112, 116, 67, 114, 97, 102, 116, 83, 97, 108, 116, 33]); // "PromptCraftSalt!"

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(PASSPHRASE),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: SALT,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(plainText: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const key = await getCryptoKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      enc.encode(plainText)
    );
    
    // Combine IV and Ciphertext for storage
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

export async function decryptData(cipherText: string): Promise<string> {
  try {
    const dec = new TextDecoder();
    const key = await getCryptoKey();
    const combined = new Uint8Array(
      atob(cipherText)
        .split("")
        .map((char) => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      data
    );
    
    return dec.decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}
