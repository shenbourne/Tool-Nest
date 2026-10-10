export interface SubnetInfo {
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  wildcardMask: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  cidr: number;
  ipClass: string;
  maskBinary: string;
}

export function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

export function intToIp(num: number): string {
  return `${(num >>> 24) & 255}.${(num >>> 16) & 255}.${(num >>> 8) & 255}.${num & 255}`;
}

export function isValidIpv4(ip: string): boolean {
  return /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(ip.trim());
}

export function isValidCidr(cidr: string): boolean {
  const match = cidr.trim().match(/^(.+)\/(\d+)$/);
  if (!match) return false;
  const [, ip, prefix] = match;
  const prefixNum = Number(prefix);
  return isValidIpv4(ip) && prefixNum >= 0 && prefixNum <= 32;
}

function getIPClass(ip: string): string {
  const firstOctet = Number(ip.split('.')[0]);
  if (firstOctet < 128) return 'A';
  if (firstOctet < 192) return 'B';
  if (firstOctet < 224) return 'C';
  if (firstOctet < 240) return 'D';
  if (firstOctet < 256) return 'E';
  return 'Unknown';
}

export function parseCidr(cidr: string): SubnetInfo | null {
  const trimmed = cidr.trim();
  const match = trimmed.match(/^(.+)\/(\d+)$/);

  let ip: string;
  let prefix: number;

  if (match) {
    ip = match[1];
    prefix = Number(match[2]);
  } else if (isValidIpv4(trimmed)) {
    ip = trimmed;
    prefix = 32;
  } else {
    return null;
  }

  if (!isValidIpv4(ip) || prefix < 0 || prefix > 32) return null;

  const ipInt = ipToInt(ip);
  const mask = prefix === 0 ? 0 : (~((1 << (32 - prefix)) - 1)) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? (prefix === 32 ? 1 : 2) : totalHosts - 2;
  const firstHost = prefix >= 31 ? network : (network + 1) >>> 0;
  const lastHost = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0;

  const maskBinary = '1'.repeat(prefix) + '0'.repeat(32 - prefix);

  return {
    networkAddress: intToIp(network),
    broadcastAddress: intToIp(broadcast),
    subnetMask: intToIp(mask),
    wildcardMask: intToIp(~mask >>> 0),
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    totalHosts,
    usableHosts,
    cidr: prefix,
    ipClass: getIPClass(ip),
    maskBinary: maskBinary.match(/.{8}/g)?.join('.') ?? '',
  };
}
