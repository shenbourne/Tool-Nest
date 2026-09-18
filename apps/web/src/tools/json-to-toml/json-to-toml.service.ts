import { stringify } from '@iarna/toml';

export interface ConvertResult { result: string; error: string | null; }

export function jsonToToml(input: string): ConvertResult {
  try {
    if (!input.trim()) {
      return { result: '', error: null };
    }
    const parsed = JSON.parse(input);
    return { result: stringify(parsed), error: null };
  } catch (e: unknown) {
    return { result: '', error: e instanceof Error ? e.message : String(e) };
  }
}
