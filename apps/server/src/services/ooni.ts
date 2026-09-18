const OONI_API_BASE = 'https://api.ooni.io/api/v1';

export interface CensorshipResult {
  input: string;
  confirmed: boolean;
  anomaly: boolean;
}

export const OoniService = {
  async checkCensorship(urls: string[]): Promise<CensorshipResult[]> {
    if (urls.length === 0) {
      throw new Error('At least one URL is required');
    }

    const res = await fetch(`${OONI_API_BASE}/measurements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: urls,
        test_name: 'web_connectivity',
        since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }),
    });

    if (!res.ok) {
      throw new Error(`OONI API error ${res.status}`);
    }

    const data = (await res.json()) as { results: CensorshipResult[] };
    return data.results;
  },
};
