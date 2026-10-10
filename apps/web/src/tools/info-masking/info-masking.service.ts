// Info Masking - business logic

export type MaskPattern = 'email' | 'phone' | 'ip' | 'creditCard' | 'idCard';

export interface MaskPatternDef {
  key: MaskPattern;
  labelKey: string;
  regex: RegExp;
}

export const MASK_PATTERNS: MaskPatternDef[] = [
  {
    key: 'email',
    labelKey: 'tools.infoMasking.patternEmail',
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  },
  {
    key: 'phone',
    labelKey: 'tools.infoMasking.patternPhone',
    regex: /(?<!\d)(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}(?!\d)/g,
  },
  {
    key: 'ip',
    labelKey: 'tools.infoMasking.patternIp',
    regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
  },
  {
    key: 'creditCard',
    labelKey: 'tools.infoMasking.patternCreditCard',
    regex: /\b(?:\d[ -]*?){13,16}\b/g,
  },
];

export interface MaskOptions {
  maskChar: string;
  enabledPatterns: Set<MaskPattern>;
  preserveFirst: number;
  preserveLast: number;
}

export function maskText(text: string, options: MaskOptions): string {
  let result = text;

  for (const pattern of MASK_PATTERNS) {
    if (!options.enabledPatterns.has(pattern.key)) continue;

    result = result.replace(pattern.regex, (match) => {
      return maskValue(match, options.maskChar, options.preserveFirst, options.preserveLast);
    });
  }

  return result;
}

function maskValue(value: string, maskChar: string, preserveFirst: number, preserveLast: number): string {
  if (value.length <= preserveFirst + preserveLast) {
    return maskChar.repeat(value.length);
  }

  const first = preserveFirst > 0 ? value.slice(0, preserveFirst) : '';
  // `slice(-0)` returns the whole string, so a 0 preserve must not negate the
  // mask — otherwise the output leaks the entire original value.
  const last = preserveLast > 0 ? value.slice(-preserveLast) : '';
  const masked = maskChar.repeat(value.length - preserveFirst - preserveLast);

  return first + masked + last;
}

export function detectPatterns(text: string): { pattern: MaskPatternDef; count: number }[] {
  return MASK_PATTERNS.map(p => ({
    pattern: p,
    count: (text.match(p.regex) || []).length,
  })).filter(r => r.count > 0);
}
