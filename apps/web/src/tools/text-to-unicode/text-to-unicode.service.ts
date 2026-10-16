export function convertTextToUnicode(text: string): string {
  return Array.from(text)
    .map(ch => `&#${ch.codePointAt(0)};`)
    .join('');
}

export function convertUnicodeToText(unicodeStr: string): string {
  return unicodeStr.replace(/&#(\d+);/g, (match, code) => {
    const scalar = Number(code);
    return Number.isInteger(scalar) && scalar >= 0 && scalar <= 0x10ffff && !(scalar >= 0xd800 && scalar <= 0xdfff)
      ? String.fromCodePoint(scalar)
      : match;
  });
}
