export function convertTextToAsciiBinary(text: string, { separator = ' ' }: { separator?: string } = {}): string {
  return text
    .split('')
    .map(ch => ch.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(separator);
}

export function convertAsciiBinaryToText(binary: string): string {
  // Reject anything that is not 0/1 (ignoring whitespace) instead of silently
  // stripping stray characters, which could turn a typo into a "valid" decode.
  const compact = binary.replace(/\s+/g, '');
  if (compact.length === 0 || /[^01]/.test(compact) || compact.length % 8 !== 0) {
    throw new Error('Invalid binary string');
  }
  return compact
    .split(/(\d{8})/)
    .filter(Boolean)
    .map(b => String.fromCharCode(parseInt(b, 2)))
    .join('');
}
