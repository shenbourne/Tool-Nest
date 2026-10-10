export function generateNumeronym(word: string): string {
  const len = word.length;
  if (len <= 3) return word;
  return `${word.at(0)}${len - 2}${word.at(-1)}`;
}
