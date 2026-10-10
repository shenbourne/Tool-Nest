export function splitPrefix(prefix: string): string[] {
  const base = /[^0-9a-f]/i.test(prefix)
    ? prefix.split(/[^0-9a-f]/i)
    : (prefix.match(/.{1,2}/g) ?? []);

  return base.filter(Boolean).map(byte => byte.padStart(2, '0'));
}

export function isValidMacPrefix(prefix: string): boolean {
  if (prefix.trim() === '') return true;
  const parts = splitPrefix(prefix);
  return parts.length <= 6 && parts.every(p => /^[0-9a-f]{2}$/i.test(p));
}

export function generateRandomMacAddress(options: {
  prefix?: string;
  separator?: string;
  uppercase?: boolean;
} = {}): string {
  const { prefix: rawPrefix = '', separator = ':', uppercase = true } = options;
  const prefix = splitPrefix(rawPrefix);

  if (prefix.length > 6) return '';

  const remainingBytes = 6 - prefix.length;
  const randomBytes = new Uint8Array(remainingBytes);
  crypto.getRandomValues(randomBytes);

  const randomHex = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'));

  const allBytes = [...prefix, ...randomHex];
  const result = allBytes.join(separator);

  return uppercase ? result.toUpperCase() : result.toLowerCase();
}

export function generateMacAddresses(count: number, options: {
  prefix?: string;
  separator?: string;
  uppercase?: boolean;
} = {}): string[] {
  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    results.push(generateRandomMacAddress(options));
  }
  return results;
}
