export interface UlaResult {
  ula: string;
  firstBlock: string;
  lastBlock: string;
  globalId: string;
}

export function isValidMacAddress(mac: string): boolean {
  return /^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$/.test(mac.trim());
}

export function generateULA(macAddress: string): UlaResult {
  void macAddress; // Retained input for caller compatibility; randomness supplies the global ID.
  // Generate 5 random bytes (40 bits) for the global ID per RFC 4193
  const randomBytes = new Uint8Array(5);
  crypto.getRandomValues(randomBytes);

  // Convert to hex string (10 hex chars = 40 bits)
  const hex40bit = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Build the ULA prefix: fd + first 2 hex chars : next 4 hex chars : last 4 hex chars
  const hex2 = hex40bit.substring(0, 2);
  const hex4a = hex40bit.substring(2, 6);
  const hex4b = hex40bit.substring(6, 10);

  const ula = `fd${hex2}:${hex4a}:${hex4b}`;

  return {
    ula: `${ula}::/48`,
    firstBlock: `${ula}:0::/64`,
    lastBlock: `${ula}:ffff::/64`,
    globalId: hex40bit,
  };
}
