import { format, type SqlLanguage } from 'sql-formatter';

export interface SqlFormatOptions {
  language: SqlLanguage;
  keywordCase: 'upper' | 'lower' | 'preserve';
}

export interface FormatResult { result: string; error: string | null; }

export function formatSql(input: string, options: SqlFormatOptions): FormatResult {
  try {
    if (!input.trim()) {
      return { result: '', error: null };
    }
    const formatted = format(input, {
      language: options.language,
      keywordCase: options.keywordCase,
      tabWidth: 2,
      useTabs: false,
    });
    return { result: formatted, error: null };
  } catch (e: unknown) {
    return { result: '', error: e instanceof Error ? e.message : String(e) };
  }
}
