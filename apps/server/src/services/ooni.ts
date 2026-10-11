const OONI_API_BASE = 'https://api.ooni.io/api/v1';

export interface CensorshipResult {
  input: string;
  confirmed?: boolean;
  anomaly?: boolean;
  measurementCount: number;
  countries: string[];
  latestMeasurement?: string;
}

export class OoniError extends Error {
  constructor(public readonly code: 'VALIDATION_ERROR' | 'OONI_UNAVAILABLE' | 'OONI_TIMEOUT' | 'OONI_INVALID_RESPONSE', message: string, public readonly statusCode = 502) {
    super(message);
  }
}

function normalizeUrl(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 2048) {
    throw new OoniError('VALIDATION_ERROR', 'Enter a valid HTTP or HTTPS URL', 400);
  }
  try {
    const input = value.trim();
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(input) ? input : `https://${input}`);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || !url.hostname.includes('.')) throw new Error();
    url.hash = '';
    return url.href;
  } catch {
    throw new OoniError('VALIDATION_ERROR', 'Enter a valid HTTP or HTTPS URL', 400);
  }
}

export const OoniService = {
  async checkCensorship(urls: string[]): Promise<CensorshipResult[]> {
    if (!Array.isArray(urls) || urls.length === 0 || urls.length > 10) {
      throw new OoniError('VALIDATION_ERROR', 'Provide between 1 and 10 URLs', 400);
    }
    const normalized = [...new Set(urls.map(normalizeUrl))];
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return Promise.all(normalized.map(async input => {
      const params = new URLSearchParams({
        input,
        test_name: 'web_connectivity',
        since,
        limit: '100',
        order: 'desc',
        failure: 'false',
      });
      let res: Response;
      try {
        res = await fetch(`${OONI_API_BASE}/measurements?${params}`, { signal: AbortSignal.timeout(20000) });
      } catch (error) {
        const cause = error instanceof Error && error.cause && typeof error.cause === 'object' ? error.cause as { code?: string } : undefined;
        if (error instanceof Error && (['TimeoutError', 'AbortError'].includes(error.name) || cause?.code === 'UND_ERR_CONNECT_TIMEOUT')) {
          throw new OoniError('OONI_TIMEOUT', 'OONI measurement query timed out', 504);
        }
        throw new OoniError('OONI_UNAVAILABLE', 'OONI measurement service could not be reached');
      }
      if (!res.ok) throw new OoniError('OONI_UNAVAILABLE', `OONI API error ${res.status}`);
      const data: unknown = await res.json().catch(() => null);
      if (!data || typeof data !== 'object' || !('results' in data) || !Array.isArray(data.results)) {
        throw new OoniError('OONI_INVALID_RESPONSE', 'Invalid OONI measurement response');
      }
      const rows = data.results.filter((value): value is Record<string, unknown> => !!value && typeof value === 'object' && value.input === input && value.failure !== true);
      const assessed = rows.filter(row => typeof row.confirmed === 'boolean' && typeof row.anomaly === 'boolean');
      const dates = rows.map(row => row.measurement_start_time).filter((value): value is string => typeof value === 'string').sort();
      return {
        input,
        confirmed: assessed.length ? assessed.some(row => row.confirmed === true) : undefined,
        anomaly: assessed.length ? assessed.some(row => row.anomaly === true) : undefined,
        measurementCount: rows.length,
        countries: [...new Set(rows.map(row => row.probe_cc).filter((value): value is string => typeof value === 'string'))].sort(),
        latestMeasurement: dates.at(-1),
      };
    }));
  },
};
