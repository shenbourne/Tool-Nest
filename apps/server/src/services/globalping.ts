const API_BASE = 'https://api.globalping.io/v1';

export interface MeasurementLocation {
  type: 'country' | 'city' | 'asn' | 'network' | 'magic';
  magic: string;
  limit: number;
}

export interface CreateMeasurementParams {
  type: 'ping' | 'mtr' | 'dns' | 'traceroute';
  target: string;
  locations: MeasurementLocation[];
  measurementsLimit?: number;
}

export interface MeasurementResponse {
  id: string;
  status: string;
  results?: unknown[];
}

export interface PollOptions {
  pollIntervalMs?: number;
  maxPolls?: number;
}

export const GlobalpingService = {
  async createMeasurement(params: CreateMeasurementParams): Promise<MeasurementResponse> {
    const res = await fetch(`${API_BASE}/measurements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // ToolNest locations use a tagged shape; Globalping expects a named selector.
      body: JSON.stringify({
        ...params,
        locations: params.locations.map(({ type, magic, limit }) => ({
          [type]: type === 'asn' ? Number(magic.replace(/^AS/i, '')) : magic,
          limit,
        })),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(`Globalping API error ${res.status}: ${(body as { message?: string }).message ?? 'unknown'}`);
    }

    return res.json() as Promise<MeasurementResponse>;
  },

  async getMeasurement(id: string): Promise<MeasurementResponse> {
    const res = await fetch(`${API_BASE}/measurements/${id}`);

    if (!res.ok) {
      throw new Error(`Globalping API error ${res.status}`);
    }

    return res.json() as Promise<MeasurementResponse>;
  },

  async createAndPoll(
    params: CreateMeasurementParams,
    options: PollOptions = {},
  ): Promise<MeasurementResponse> {
    const { pollIntervalMs = 500, maxPolls = 60 } = options;
    const measurement = await this.createMeasurement(params);

    for (let i = 0; i < maxPolls; i++) {
      if (measurement.status === 'finished') return measurement;

      await new Promise((r) => setTimeout(r, pollIntervalMs));
      const updated = await this.getMeasurement(measurement.id);
      Object.assign(measurement, updated);
    }

    throw new Error(`Measurement ${measurement.id} timed out after ${maxPolls} polls`);
  },
};
