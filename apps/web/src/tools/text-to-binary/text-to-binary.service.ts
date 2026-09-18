export function convertTextToAsciiBinary(text: string, { separator = ' ' }: { separator?: string } = {}): string {
  return text
    .split('')
    .map(ch => ch.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(separator);
}

export function convertAsciiBinaryToText(binary: string): string {
  const cleanBinary = binary.replace(/[^01]/g, '');
  if (cleanBinary.length === 0 || cleanBinary.length % 8 !== 0) {
    throw new Error('Invalid binary string');
  }
  return cleanBinary
    .split(/(\d{8})/)
    .filter(Boolean)
    .map(b => String.fromCharCode(parseInt(b, 2)))
    .join('');
}
