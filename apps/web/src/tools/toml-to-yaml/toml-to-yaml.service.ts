import { parse } from '@iarna/toml';
import { dump } from 'js-yaml';

export interface ConvertResult { result: string; error: string | null; }

export function tomlToYaml(input: string): ConvertResult {
  try {
    if (!input.trim()) {
      return { result: '', error: null };
    }
    const parsed = parse(input);
    return { result: dump(parsed), error: null };
  } catch (e: unknown) {
    return { result: '', error: e instanceof Error ? e.message : String(e) };
  }
}
