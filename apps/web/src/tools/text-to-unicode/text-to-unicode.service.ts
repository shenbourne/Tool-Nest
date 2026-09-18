export function convertTextToUnicode(text: string): string {
  return text
    .split('')
    .map(ch => `&#${ch.charCodeAt(0)};`)
    .join('');
}

export function convertUnicodeToText(unicodeStr: string): string {
  return unicodeStr.replace(/&#(\d+);/g, (_match, code) =>
    String.fromCharCode(Number(code))
  );
}
