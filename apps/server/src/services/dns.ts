import { isIP } from 'node:net';
import { isValidDomain } from '@toolnest/shared';
import { AppError } from '../middleware/error-handler.js';
import { isPrivateHost } from '../middleware/security.js';

export function parseDnsServer(value: string): string {
  const server = value.trim();
  let host = server;
  let port: string | undefined;
  if (isIP(server) === 0) {
    const bracketed = /^\[([^\]]+)\](?::(\d+))?$/.exec(server);
    const ipv4Port = /^([^:]+):(\d+)$/.exec(server);
    if (bracketed) {
      host = bracketed[1]; port = bracketed[2];
      if (isIP(host) !== 6) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid DNS server address');
    } else if (ipv4Port) {
      host = ipv4Port[1]; port = ipv4Port[2];
      if (isIP(host) !== 4) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid DNS server address');
    } else throw new AppError(400, 'VALIDATION_ERROR', 'Invalid DNS server address');
  }
  if (host.includes('%') || (port !== undefined && (port.length > 5 || Number(port) < 1 || Number(port) > 65535))) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid DNS server address or port');
  }
  if (isPrivateHost(host)) throw new AppError(400, 'VALIDATION_ERROR', 'Access to private networks is blocked');
  return server;
}

interface DnsResult { domain: string; resolved: boolean; addresses: string[] }
export async function resolveDnsBatch(input: unknown, lookup: (domain: string) => Promise<string[]>): Promise<DnsResult[]> {
  if (!Array.isArray(input) || input.length === 0 || input.length > 20) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Provide between 1 and 20 domains');
  }
  const domains = input.map((value: unknown) => {
    if (typeof value !== 'string') throw new AppError(400, 'VALIDATION_ERROR', 'Each domain must be a string');
    const domain = value.trim();
    if (isPrivateHost(domain)) throw new AppError(400, 'VALIDATION_ERROR', 'Access to private networks is blocked');
    if (!isValidDomain(domain.replace(/\.$/, ''))) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid domain');
    return domain;
  });
  const results: DnsResult[] = new Array(domains.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(4, domains.length) }, async () => {
    while (cursor < domains.length) {
      const index = cursor++;
      const domain = domains[index];
      try { results[index] = { domain, resolved: true, addresses: await lookup(domain) }; }
      catch { results[index] = { domain, resolved: false, addresses: [] }; }
    }
  }));
  return results;
}
