import Papa from 'papaparse';

export interface ConvertResult { result: string; error: string | null; }

export function jsonToCsv(input: string): ConvertResult {
  try {
    if (!input.trim()) {
      return { result: '', error: null };
    }
    const parsed = JSON.parse(input);
    if (!Array.isArray(parsed)) {
      return { result: '', error: 'Input must be a JSON array of objects' };
    }
    if (parsed.length === 0) {
      return { result: '', error: null };
    }
    for (const item of parsed) {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        return { result: '', error: 'Each item in the array must be a JSON object' };
      }
    }
    return { result: Papa.unparse(parsed), error: null };
  } catch (e: unknown) {
    return { result: '', error: e instanceof Error ? e.message : String(e) };
  }
}
