import yaml from 'js-yaml';

export interface ConvertResult { result: string; error: string | null; }

export function jsonToYaml(input: string): ConvertResult {
  // Empty input is not an error — match json-to-xml and return quietly so the
  // tool does not flash an error the moment it opens.
  if (!input.trim()) {
    return { result: '', error: null };
  }
  try {
    const parsed = JSON.parse(input);
    return { result: yaml.dump(parsed), error: null };
  } catch (e: unknown) {
    return { result: '', error: e instanceof Error ? e.message : String(e) };
  }
}
