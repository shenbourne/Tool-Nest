export function isValidIpv4(ip: string): boolean {
  return /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(ip.trim());
}

export function ipv4ToInt(ip: string): number {
  if (!isValidIpv4(ip)) return 0;
  return ip
    .trim()
    .split('.')
    .reduce((acc, part, index) => acc + Number(part) * 256 ** (3 - index), 0);
}

export function intToBinary(num: number): string {
  return (num >>> 0).toString(2).padStart(32, '0');
}

export function ipToBinaryDotted(ip: string): string {
  if (!isValidIpv4(ip)) return '';
  return ip
    .trim()
    .split('.')
    .map(part => Number(part).toString(2).padStart(8, '0'))
    .join('.');
}

export function ipToHexDotted(ip: string): string {
  if (!isValidIpv4(ip)) return '';
  return ip
    .trim()
    .split('.')
    .map(part => Number(part).toString(16).padStart(2, '0').toUpperCase())
    .join('.');
}

export function ipToOctalDotted(ip: string): string {
  if (!isValidIpv4(ip)) return '';
  return ip
    .trim()
    .split('.')
    .map(part => Number(part).toString(8).padStart(3, '0'))
    .join('.');
}

export function ipv4ToIpv6(ip: string, prefix = '0000:0000:0000:0000:0000:ffff:'): string {
  if (!isValidIpv4(ip)) return '';
  return (
    prefix
    + ip
      .trim()
      .split('.')
      .map(part => Number(part).toString(16).padStart(2, '0'))
      .reduce((acc, hex, i) => {
        if (i % 2 === 0) acc.push(hex);
        else acc[acc.length - 1] += hex;
        return acc;
      }, [] as string[])
      .join(':')
  );
}

export interface ConvertedIpFormats {
  decimal: string;
  binary: string;
  hex: string;
  octal: string;
  integer: string;
  ipv6: string;
  ipv6Short: string;
}

export function convertIpv4(ip: string): ConvertedIpFormats | null {
  if (!isValidIpv4(ip)) return null;

  const intVal = ipv4ToInt(ip);

  return {
    decimal: ip.trim(),
    binary: ipToBinaryDotted(ip),
    hex: ipToHexDotted(ip),
    octal: ipToOctalDotted(ip),
    integer: String(intVal),
    ipv6: ipv4ToIpv6(ip),
    ipv6Short: ipv4ToIpv6(ip, '::ffff:'),
  };
}
