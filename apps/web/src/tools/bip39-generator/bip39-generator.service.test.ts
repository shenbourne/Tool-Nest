import { it, expect } from 'vitest';
import { validateMnemonic as validateWithReference } from 'bip39';
import { generateMnemonic, validateMnemonic } from './bip39-generator.service';
it('validates known BIP39 vector and rejects invalid checksum', () => {
  expect(validateMnemonic('abandon '.repeat(11) + 'about')).toBe(true);
  expect(validateMnemonic('abandon '.repeat(12))).toBe(false);
});
it('generates valid mnemonics at every supported length', () => {
  for (const n of [12,15,18,21,24]) {
    const mnemonic = generateMnemonic(n);
    expect(mnemonic.split(' ')).toHaveLength(n);
    expect(validateMnemonic(mnemonic)).toBe(true);
    expect(validateWithReference(mnemonic)).toBe(true);
  }
});
