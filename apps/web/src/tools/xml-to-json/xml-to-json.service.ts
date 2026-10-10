import convert from 'xml-js';

export interface ConvertResult { result: string; error: string | null; }

export function xmlToJson(input: string): ConvertResult {
  try {
    if (!input.trim()) {
      return { result: '', error: null };
    }
    const parsed = convert.xml2js(input, { compact: true });
    return { result: JSON.stringify(parsed, null, 2), error: null };
  } catch (e: unknown) {
    return { result: '', error: e instanceof Error ? e.message : String(e) };
  }
}
