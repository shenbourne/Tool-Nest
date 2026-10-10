import { parse } from '@iarna/toml';

export interface ConvertResult { result: string; error: string | null; }

export function tomlToJson(input: string): ConvertResult {
  try {
    if (!input.trim()) {
      return { result: '', error: null };
    }
    const parsed = parse(input);
    return { result: JSON.stringify(parsed, null, 2), error: null };
  } catch (e: unknown) {
    return { result: '', error: e instanceof Error ? e.message : String(e) };
  }
}
