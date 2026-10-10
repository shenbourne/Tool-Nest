import { MD5, SHA1, SHA256, SHA512, SHA224, SHA384, RIPEMD160, SHA3 } from 'crypto-js';

export const hashAlgorithms = {
  MD5, SHA1, SHA256, SHA512, SHA224, SHA384, RIPEMD160, SHA3,
} as const;

export type HashAlgorithm = keyof typeof hashAlgorithms;

export function hashText(text: string, algorithm: HashAlgorithm): string {
  return hashAlgorithms[algorithm](text).toString();
}

export function convertHexToBin(hex: string): string {
  return hex.trim().split('').map(byte => parseInt(byte, 16).toString(2).padStart(4, '0')).join('');
}
