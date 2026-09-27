const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
  5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
};

const REVERSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

// Morse payloads consist of these characters only; text like "Hello." must not
// be misdetected as morse just because it contains a dot.
const MORSE_ONLY = /^[.\-/ ]+$/;

export function looksLikeMorse(input: string): boolean {
  const t = input.trim();
  return t.length > 0 && MORSE_ONLY.test(t);
}

export function decodeMorse(input: string): string {
  return input
    .trim()
    .split(' / ')
    .map(word => word.split(' ').map(code => REVERSE[code] || '').join(''))
    .join(' ');
}

export function encodeMorse(input: string): string {
  return input
    .toUpperCase()
    .split('')
    .map(c => (c === ' ' ? '/' : MORSE[c] || ''))
    .filter(Boolean)
    .join(' ');
}

export function convertMorse(input: string): string {
  const t = input.trim();
  if (!t) return '';
  return looksLikeMorse(t) ? decodeMorse(t) : encodeMorse(t);
}

/** Characters (uppercased, deduplicated) that cannot be encoded to morse. */
export function unmappableChars(input: string): string[] {
  const set = new Set<string>();
  for (const c of input.toUpperCase()) {
    if (c === ' ' || MORSE[c]) continue;
    set.add(c);
  }
  return [...set];
}
