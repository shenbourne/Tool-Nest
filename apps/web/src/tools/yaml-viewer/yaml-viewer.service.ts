import yaml from 'js-yaml';

export interface ConvertResult { result: string; error: string | null; }

export interface FormatYamlOptions {
  sortKeys: boolean;
  indentSize: number;
}

export function formatYaml(rawYaml: string, options: FormatYamlOptions): ConvertResult {
  try {
    const parsed = yaml.load(rawYaml);
    if (parsed === undefined) {
      return { result: '', error: null };
    }
    return {
      result: yaml.dump(parsed, { sortKeys: options.sortKeys, indent: options.indentSize }),
      error: null,
    };
  } catch (e: unknown) {
    return { result: '', error: e instanceof Error ? e.message : String(e) };
  }
}
