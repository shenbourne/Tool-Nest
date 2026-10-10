export const DEFAULT_SENSITIVE_WORDS = ['bad', 'evil', 'hack', 'damn', 'hell'];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Masks whole words only. Plain substring replacement censors innocent words
 * that merely contain a sensitive one (`hello` → `h***o`), so word boundaries
 * are required on both sides.
 */
export function censorText(input: string, words: string[] = DEFAULT_SENSITIVE_WORDS): string {
  let result = input;
  for (const word of words) {
    if (!word) continue;
    const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi');
    result = result.replace(pattern, m => m[0] + '*'.repeat(m.length - 1));
  }
  return result;
}
