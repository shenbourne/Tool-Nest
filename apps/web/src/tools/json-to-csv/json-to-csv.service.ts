import Papa from 'papaparse';
import { i18n } from '@/i18n';

export interface ConvertResult { result: string; error: string | null; }

export function jsonToCsv(input: string): ConvertResult {
  try {
    if (!input.trim()) {
      return { result: '', error: null };
    }
    const parsed = JSON.parse(input);
    if (!Array.isArray(parsed)) {
      return { result: '', error: i18n.global.t('tools.jsonToCsv.errorNotArray') };
    }
    if (parsed.length === 0) {
      return { result: '', error: null };
    }
    for (const item of parsed) {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        return { result: '', error: i18n.global.t('tools.jsonToCsv.errorItemNotObject') };
      }
    }
    return { result: Papa.unparse(parsed), error: null };
  } catch (e: unknown) {
    return { result: '', error: e instanceof Error ? e.message : String(e) };
  }
}
