import convert from 'xml-js';

export interface ConvertResult { result: string; error: string | null; }

export function jsonToXml(input: string): ConvertResult {
  try {
    if (!input.trim()) {
      return { result: '', error: null };
    }
    const parsed = JSON.parse(input);
    return { result: convert.js2xml(parsed, { compact: true, spaces: 2 }), error: null };
  } catch (e: unknown) {
    return { result: '', error: e instanceof Error ? e.message : String(e) };
  }
}
