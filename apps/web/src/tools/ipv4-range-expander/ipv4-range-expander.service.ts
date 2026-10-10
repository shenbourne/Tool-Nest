import { isValidIpv4, ipv4ToInt } from '../ipv4-address-converter/ipv4-address-converter.service';

export interface RangeExpanderResult {
  oldStart: string;
  oldEnd: string;
  newStart: string;
  newEnd: string;
  newCidr: string;
  oldSize: number;
  newSize: number;
  cidrPrefix: number;
}

function intToIp(num: number): string {
  return `${(num >>> 24) & 255}.${(num >>> 16) & 255}.${(num >>> 8) & 255}.${num & 255}`;
}

function intToBinary32(num: number): string {
  return (num >>> 0).toString(2).padStart(32, '0');
}

function binaryToInt(bin: string): number {
  return parseInt(bin, 2);
}

export function calculateCidr(startIp: string, endIp: string): RangeExpanderResult | null {
  if (!isValidIpv4(startIp) || !isValidIpv4(endIp)) return null;

  const startInt = ipv4ToInt(startIp);
  const endInt = ipv4ToInt(endIp);

  if (startInt > endInt) return null;

  const startBin = intToBinary32(startInt);
  const endBin = intToBinary32(endInt);

  // Find common prefix length
  let commonPrefix = 0;
  for (let i = 0; i < 32; i++) {
    if (startBin[i] === endBin[i]) {
      commonPrefix++;
    } else {
      break;
    }
  }

  // Build the CIDR block from common prefix
  const newStartBin = startBin.substring(0, commonPrefix) + '0'.repeat(32 - commonPrefix);
  const newEndBin = startBin.substring(0, commonPrefix) + '1'.repeat(32 - commonPrefix);

  const newStartInt = binaryToInt(newStartBin);
  const newEndInt = binaryToInt(newEndBin);

  const oldSize = endInt - startInt + 1;
  const newSize = newEndInt - newStartInt + 1;

  return {
    oldStart: startIp,
    oldEnd: endIp,
    newStart: intToIp(newStartInt),
    newEnd: intToIp(newEndInt),
    newCidr: `${intToIp(newStartInt)}/${commonPrefix}`,
    oldSize,
    newSize,
    cidrPrefix: commonPrefix,
  };
}
