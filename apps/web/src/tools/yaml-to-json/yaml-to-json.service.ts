import yaml from 'js-yaml';

export interface ConvertResult { result: string; error: string | null; }

export function yamlToJson(input: string): ConvertResult {
  try {
    const parsed = yaml.load(input);
    if (parsed === undefined) {
      return { result: '', error: null };
    }
    return { result: JSON.stringify(parsed, null, 2), error: null };
  } catch (e: unknown) {
    return { result: '', error: e instanceof Error ? e.message : String(e) };
  }
}
