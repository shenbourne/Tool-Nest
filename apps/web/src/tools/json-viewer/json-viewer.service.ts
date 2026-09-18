export interface JsonFormatResult {
  formatted: string;
  error: string | null;
}

export function formatJson(input: string, indentSize: number = 2): JsonFormatResult {
  if (!input.trim()) {
    return { formatted: '', error: null };
  }

  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, indentSize);
    return { formatted, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid JSON';
    return { formatted: '', error: message };
  }
}

export function isValidJson(input: string): boolean {
  if (!input.trim()) return true;
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
}
