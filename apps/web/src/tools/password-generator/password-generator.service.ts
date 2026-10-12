export interface SecretOptions {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
  exclude?: string;
}

export const secretPresets: Record<'password' | 'token', SecretOptions> = {
  password: { length: 16, upper: true, lower: true, numbers: true, symbols: true },
  token: { length: 64, upper: true, lower: true, numbers: true, symbols: false },
};

export function generateSecret(options: SecretOptions): string {
  if (!Number.isInteger(options.length) || options.length < 1 || options.length > 512) throw new Error('invalidLength');
  const alphabet = [
    options.upper ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
    options.lower ? 'abcdefghijklmnopqrstuvwxyz' : '',
    options.numbers ? '0123456789' : '',
    options.symbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?/"\'\\' : '',
  ].join('').split('').filter(char => !options.exclude?.includes(char)).join('');
  if (!alphabet) throw new Error('selectOneOption');

  // Reject the incomplete final bucket to avoid modulo bias.
  const limit = Math.floor(0x100000000 / alphabet.length) * alphabet.length;
  const values = new Uint32Array(options.length);
  let result = '';
  while (result.length < options.length) {
    crypto.getRandomValues(values);
    for (const value of values) {
      if (value < limit) result += alphabet[value % alphabet.length];
      if (result.length === options.length) break;
    }
  }
  return result;
}
