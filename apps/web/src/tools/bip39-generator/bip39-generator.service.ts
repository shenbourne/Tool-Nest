import CryptoJS from 'crypto-js';
import { wordlists } from 'bip39';

const words = wordlists.english;
export function generateMnemonic(wordCount: number): string {
  if (![12, 15, 18, 21, 24].includes(wordCount)) throw new Error('Invalid word count');
  const entropy = crypto.getRandomValues(new Uint8Array(wordCount / 3 * 4));
  const hex = Array.from(entropy, byte => byte.toString(16).padStart(2, '0')).join('');
  const bits = Array.from(entropy, byte => byte.toString(2).padStart(8, '0')).join('');
  const checksum = parseInt(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(hex)).toString().slice(0, 2), 16).toString(2).padStart(8, '0');
  return (bits + checksum.slice(0, entropy.length / 4)).match(/.{11}/g)!.map(part => words[parseInt(part, 2)]).join(' ');
}
export function validateMnemonic(mnemonic: string): boolean {
  const parts = mnemonic.trim().split(/\s+/);
  if (![12, 15, 18, 21, 24].includes(parts.length)) return false;
  const indices = parts.map(word => words.indexOf(word));
  if (indices.some(index => index < 0)) return false;
  const bits = indices.map(index => index.toString(2).padStart(11, '0')).join('');
  const checksumLength = parts.length / 3;
  const entropyBits = bits.slice(0, -checksumLength);
  const hex = entropyBits.match(/.{8}/g)!.map(part => parseInt(part, 2).toString(16).padStart(2, '0')).join('');
  const checksum = parseInt(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(hex)).toString().slice(0, 2), 16).toString(2).padStart(8, '0');
  return bits.slice(-checksumLength) === checksum.slice(0, checksumLength);
}
