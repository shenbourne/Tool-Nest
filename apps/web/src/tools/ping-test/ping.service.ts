export class PingRequestError extends Error {
  constructor(public readonly code: 'serviceUnavailable' | 'invalidResponse' | 'rateLimited' | 'requestFailed') {
    super(code);
  }
}

export async function requestPing(target: string): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch('/api/network/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: target.trim() }),
    });
  } catch {
    throw new PingRequestError('serviceUnavailable');
  }
  const json: unknown = await res.json().catch(() => null);
  const envelope = json && typeof json === 'object' ? json as Record<string, unknown> : null;
  if (envelope?.success === false) {
    const error = envelope.error;
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      throw new Error(error.message);
    }
  }
  if (!res.ok) {
    throw new PingRequestError(res.status === 429 ? 'rateLimited' : res.status >= 500 ? 'serviceUnavailable' : 'requestFailed');
  }
  if (!envelope || envelope.success !== true || !('data' in envelope)) {
    throw new PingRequestError('invalidResponse');
  }
  return envelope.data;
}
