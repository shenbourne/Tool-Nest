import yaml from 'js-yaml';
import * as TOML from '@iarna/toml';

export interface ConvertResult { result: string; error: string | null; }

export function yamlToToml(input: string): ConvertResult {
  try {
    const parsed = yaml.load(input);
    if (parsed === undefined || parsed === null) {
      return { result: '', error: null };
    }
    return { result: TOML.stringify(parsed as TOML.JsonMap), error: null };
  } catch (e: unknown) {
    return { result: '', error: e instanceof Error ? e.message : String(e) };
  }
}
