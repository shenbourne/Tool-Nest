import { describe, expect, it } from 'vitest';
import { buildNetworkGroups, displayValue } from './network-results';
const label = (key: string) => key;
describe('network result presentation', () => {
  it('maps actual MTR nested hops and preserves unknown metrics', () => {
    const groups = buildNetworkGroups({ results: [{ probe: { city: 'Buffalo', country: 'US' }, result: { status: 'finished', hops: [{ asn: [174], resolvedAddress: '1.1.1.1', stats: { avg: 1.125, loss: 0, rcv: 3 } }, { asn: [], stats: { avg: null, loss: 100 } }] } }] }, 'mtr', label);
    expect(groups[0].title).toBe('Buffalo, US');
    expect(groups[0].rows?.[0]).toContain('1.13 ms');
    expect(groups[0].rows?.[1]).toContain('—');
    expect(groups[0].rows?.[1]).toContain('100 %');
  });
  it('maps DNS timing.total and answer.value from real Globalping shape', () => {
    const [group] = buildNetworkGroups({ results: [{ result: { status: 'finished', timings: { total: 43 }, answers: [{ name: 'example.com.', type: 'A', value: '1.1.1.1', ttl: 300 }] } }] }, 'latency', label);
    expect(group.fields?.[0].value).toBe('43 ms');
    expect(group.rows).toEqual([['example.com.', 'A', '1.1.1.1', '300']]);
  });
  it('does not label missing or negative censorship evidence as safe', () => {
    const groups = buildNetworkGroups([{ input: 'a', confirmed: true }, { input: 'b', anomaly: true }, { input: 'c', confirmed: false, anomaly: false }, { input: 'd' }], 'censorship', label);
    expect(groups.map(g => g.state)).toEqual(['networkResults.confirmed', 'networkResults.anomaly', 'networkResults.noEvidence', 'networkResults.unknown']);
  });
  it('handles missing and empty result lists without inventing metrics', () => {
    expect(buildNetworkGroups(null, 'mtr', label)).toEqual([]);
    expect(buildNetworkGroups([], 'dns-leak', label)).toEqual([]);
    expect(displayValue(0)).toBe('0');
    expect(displayValue(null)).toBe('—');
    expect(displayValue(Infinity)).toBe('—');
  });
  it('renders resolved addresses and failed DNS checks separately', () => {
    const groups = buildNetworkGroups([{ domain: 'a', resolved: true, addresses: ['1.1.1.1'] }, { domain: 'b', resolved: false, addresses: [] }], 'dns-leak', label);
    expect(groups[0].rows).toEqual([['1.1.1.1']]);
    expect(groups[1].tone).toBe('warning');
  });
  it('extracts RDAP registrar, nameservers and event labels', () => {
    const [group] = buildNetworkGroups({ ldhName: 'EXAMPLE.COM', entities: [{ roles: ['registrar'], vcardArray: ['vcard', [['fn', {}, 'text', 'Registrar Inc']]] }], nameservers: [{ ldhName: 'ns.example.com' }], events: [{ eventAction: 'expiration', eventDate: '2027-01-01' }] }, 'whois', label);
    expect(group.fields?.[0].value).toBe('Registrar Inc');
    expect(group.fields?.[2].value).toBe('ns.example.com');
    expect(group.rows).toEqual([['networkResults.expires', '2027-01-01']]);
  });
});
