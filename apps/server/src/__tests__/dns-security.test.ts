import { describe, expect, it } from 'vitest';
import { parseDnsServer, resolveDnsBatch } from '../services/dns.js';

describe('DNS resolver boundary', () => {
  it.each(['[::1]:53', '[0:0:0:0:0:0:0:1]:5353', '127.0.0.1:53', '[::ffff:127.0.0.1]:53', '[fd12::1]:53', 'fc01::1'])('rejects private %s', value => {
    expect(() => parseDnsServer(value)).toThrow('private networks');
  });
  it.each(['garbage', '8.8.8.8:0', '[::1]:bad', '8.8.8.8:65536', '8.8.8.8:53/trash'])('rejects invalid %s', value => {
    expect(() => parseDnsServer(value)).toThrow();
  });
  it.each(['8.8.8.8', '1.1.1.1:5353', '2001:4860:4860::8888', '[2606:4700:4700::1111]:53'])('keeps public %s', value => {
    expect(parseDnsServer(value)).toBe(value);
  });
});

describe('DNS batch work budget', () => {
  it('rejects excessive or malformed work before starting a lookup', async () => {
    let calls = 0;
    const lookup = async () => { calls++; return ['1.2.3.4']; };
    await expect(resolveDnsBatch(Array(21).fill('example.com'), lookup)).rejects.toThrow();
    await expect(resolveDnsBatch(['example.com', 123], lookup)).rejects.toThrow();
    await expect(resolveDnsBatch(['example.com', 'localhost'], lookup)).rejects.toThrow();
    expect(calls).toBe(0);
  });
  it('bounds actual simultaneous work and preserves results and failure order', async () => {
    let active = 0, peak = 0;
    const domains = Array.from({ length: 20 }, (_, i) => `d${i}.example.com`);
    const result = await resolveDnsBatch(domains, async (domain) => {
      active++; peak = Math.max(peak, active);
      await new Promise(resolve => setTimeout(resolve, domain.startsWith('d0.') ? 10 : 1));
      active--;
      if (domain.startsWith('d3.')) throw new Error('not found');
      return ['1.2.3.4'];
    });
    expect(peak).toBeLessThanOrEqual(4);
    expect(result.map(item => item.domain)).toEqual(domains);
    expect(result[3]).toEqual({ domain: 'd3.example.com', resolved: false, addresses: [] });
    expect(result[0]).toEqual({ domain: 'd0.example.com', resolved: true, addresses: ['1.2.3.4'] });
  });
});
