import { i18n } from '@/i18n';
export interface MinifyResult {
  result: string;
  error: string | null;
}

export function minifyJson(input: string): MinifyResult {
  if (!input.trim()) return { result: '', error: null };
  try {
    const parsed = JSON.parse(input);
    return { result: JSON.stringify(parsed), error: null };
  } catch (e) {
    return { result: '', error: e instanceof Error ? e.message : i18n.global.t('common.invalidJson') };
  }
}
