export const natoAlphabet = [
  'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot',
  'Golf', 'Hotel', 'India', 'Juliet', 'Kilo', 'Lima',
  'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 'Romeo',
  'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'X-ray',
  'Yankee', 'Zulu',
];

export function textToNatoAlphabet(text: string): string {
  return text
    .split('')
    .map((ch) => {
      const idx = ch.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
      return natoAlphabet[idx] ?? ch;
    })
    .join(' ');
}
