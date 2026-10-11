export async function readReadmeUrl(value: string, fetcher: typeof fetch = fetch): Promise<string> {
  const url = new URL(value.trim());
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Invalid file URL');
  }
  const response = await fetcher(url.href, {
    credentials: 'omit',
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (response.headers.get('content-type')?.includes('text/html')) {
    throw new Error('Use a raw file URL');
  }
  return response.text();
}
