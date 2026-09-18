import yaml from 'js-yaml';

export interface ConvertResult { result: string; error: string | null; }

export function jsonToYaml(input: string): ConvertResult {
  try {
    const parsed = JSON.parse(input);
    return { result: yaml.dump(parsed), error: null };
  } catch (e: unknown) {
    return { result: '', error: e instanceof Error ? e.message : String(e) };
  }
}
