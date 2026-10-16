export function formatJson(input: string, indent: number | 'tab' = 2): { formatted: string; error: string | null } {
  if (!input.trim()) return { formatted: '', error: null };
  try {
    const parsed: unknown = JSON.parse(input);
    return { formatted: JSON.stringify(parsed, null, indent === 'tab' ? '\t' : indent), error: null };
  } catch (error) {
    return { formatted: '', error: error instanceof Error ? error.message : String(error) };
  }
}
