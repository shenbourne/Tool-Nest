import { i18n } from '@/i18n';
export interface NormalizedEmail {
  original: string;
  normalized: string;
  error: string | null;
}

const GMAIL_DOMAINS = ['gmail.com', 'googlemail.com'];

export function normalizeEmail(email: string): NormalizedEmail {
  const trimmed = email.trim();

  if (!trimmed) {
    return { original: trimmed, normalized: '', error: null };
  }

  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex === -1 || atIndex === 0 || atIndex === trimmed.length - 1) {
    return { original: trimmed, normalized: '', error: i18n.global.t('tools.emailNormalizer.errorMissingAt') };
  }

  const localPart = trimmed.substring(0, atIndex);
  const domain = trimmed.substring(atIndex + 1);

  // Lowercase the domain
  const normalizedDomain = domain.toLowerCase();

  let normalizedLocal = localPart;

  // Gmail-specific rules
  if (GMAIL_DOMAINS.includes(normalizedDomain)) {
    // Remove dots from local part
    normalizedLocal = normalizedLocal.replace(/\./g, '');

    // Remove + aliases (everything after + up to @)
    const plusIndex = normalizedLocal.indexOf('+');
    if (plusIndex !== -1) {
      normalizedLocal = normalizedLocal.substring(0, plusIndex);
    }
  }

  const normalized = `${normalizedLocal}@${normalizedDomain}`;

  return { original: trimmed, normalized, error: null };
}

export function normalizeEmails(input: string): NormalizedEmail[] {
  return input.split('\n').filter(line => line.trim()).map(line => normalizeEmail(line));
}
