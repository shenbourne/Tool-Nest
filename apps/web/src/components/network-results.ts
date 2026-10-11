export type NetworkResultKind = 'mtr' | 'latency' | 'rule' | 'dns-leak' | 'censorship' | 'whois';
type Tone = 'success' | 'warning' | 'error' | 'default';
export interface ResultGroup {
  title: string;
  subtitle?: string;
  state?: string;
  tone?: Tone;
  fields?: { label: string; value: string }[];
  columns?: string[];
  rows?: string[][];
  log?: string;
}
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
export const displayValue = (value: unknown): string => {
  if (typeof value === 'number') return Number.isFinite(value) ? String(Math.round(value * 100) / 100) : '—';
  return typeof value === 'string' && value.length ? value : '—';
};
const unit = (value: unknown, suffix: string) => displayValue(value) === '—' ? '—' : `${displayValue(value)} ${suffix}`;

export function buildNetworkGroups(data: unknown, kind: NetworkResultKind, label: (key: string) => string): ResultGroup[] {
  const l = (key: string) => label(`networkResults.${key}`);
  const root = record(data);
  if (kind === 'mtr' || kind === 'latency') {
    return list(root.results).map((value, index) => {
      const entry = record(value), probe = record(entry.probe), result = record(entry.result);
      const group: ResultGroup = {
        title: [probe.city, probe.country].filter(v => typeof v === 'string' && v).join(', ') || `${l('probe')} ${index + 1}`,
        subtitle: [probe.network, typeof probe.asn === 'number' ? `AS${probe.asn}` : ''].filter(Boolean).join(' · '),
        state: result.status === 'finished' ? l('completed') : l('failed'),
        tone: result.status === 'finished' ? 'default' : 'error',
        log: typeof result.rawOutput === 'string' ? result.rawOutput : undefined,
      };
      if (kind === 'mtr') {
        const hops = list(result.hops);
        group.fields = [{ label: l('hopCount'), value: String(hops.length) }, { label: l('targetIp'), value: displayValue(result.resolvedAddress) }];
        group.columns = [l('hop'), l('host'), 'IP', 'ASN', l('loss'), l('average'), l('minimum'), l('maximum'), l('received')];
        group.rows = hops.map((value, i) => {
          const hop = record(value), stats = record(hop.stats);
          return [String(i + 1), displayValue(hop.resolvedHostname), displayValue(hop.resolvedAddress), list(hop.asn).map(displayValue).join(', ') || '—', unit(stats.loss, '%'), unit(stats.avg, 'ms'), unit(stats.min, 'ms'), unit(stats.max, 'ms'), displayValue(stats.rcv)];
        });
      } else {
        group.fields = [{ label: l('queryTime'), value: unit(record(result.timings).total, 'ms') }, { label: l('dnsStatus'), value: displayValue(result.statusCodeName) }, { label: l('resolver'), value: displayValue(result.resolver) }];
        group.columns = [l('name'), l('type'), l('answer'), 'TTL (s)'];
        group.rows = list(result.answers).map(value => {
          const answer = record(value);
          return [displayValue(answer.name), displayValue(answer.type), displayValue(answer.value), displayValue(answer.ttl)];
        });
      }
      return group;
    });
  }
  if (kind === 'rule' || kind === 'dns-leak') {
    return (kind === 'rule' ? [root] : list(data).map(record)).map(row => ({
      title: displayValue(row.domain),
      state: kind === 'rule' || row.resolved === true ? l('resolved') : l('unresolved'),
      tone: kind === 'rule' || row.resolved === true ? 'success' : 'warning',
      columns: [l('answer')],
      rows: list(row.addresses).map(value => [displayValue(value)]),
    }));
  }
  if (kind === 'censorship') {
    return list(data).map(value => {
      const row = record(value);
      const state = row.confirmed === true ? 'confirmed' : row.anomaly === true ? 'anomaly' : row.confirmed === false && row.anomaly === false ? 'noEvidence' : 'unknown';
      return { title: displayValue(row.input), state: l(state), tone: state === 'confirmed' ? 'error' : state === 'anomaly' ? 'warning' : 'default' };
    });
  }
  const registrar = list(root.entities).map(record).find(entity => list(entity.roles).includes('registrar'));
  const card = list(registrar?.vcardArray);
  const name = list(card[1]).find(value => Array.isArray(value) && value[0] === 'fn') as unknown[] | undefined;
  return [{
    title: displayValue(root.ldhName || root.unicodeName),
    fields: [{ label: l('registrar'), value: displayValue(name?.[3]) }, { label: l('status'), value: list(root.status).map(displayValue).join(', ') || '—' }, { label: l('nameservers'), value: list(root.nameservers).map(value => displayValue(record(value).ldhName)).join(', ') || '—' }],
    columns: [l('event'), l('date')],
    rows: list(root.events).map(value => {
      const event = record(value), action = displayValue(event.eventAction);
      const eventLabels: Record<string, string> = { registration: 'registered', expiration: 'expires', 'last changed': 'updated', 'last update of RDAP database': 'databaseUpdated' };
      return [eventLabels[action] ? l(eventLabels[action]) : action, displayValue(event.eventDate)];
    }),
  }];
}
