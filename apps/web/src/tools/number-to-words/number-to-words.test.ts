import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Execute the component's actual setup logic without mounting its UI dependencies.
function convert(value: string) {
  const source = readFileSync(new URL('./NumberToWords.vue', import.meta.url), 'utf8');
  const script = source.split('<script setup lang="ts">')[1].split('</script>')[0]
    .replace(/^import .*;\r?\n/gm, '')
    .replace('n: number): string', 'n)');
  const setup = new Function('ref', 'computed', 'useI18n', `${script}\nreturn { input, error, output };`);
  const state = setup(
    (initial: string) => ({ value: initial }),
    (get: () => unknown) => ({ get value() { return get(); } }),
    () => ({ t: (key: string) => key }),
  );
  state.input.value = value;
  return { error: state.error.value, output: state.output.value };
}

describe('Number to Words component input', () => {
  it.each([
    ['0', 'zero'], ['123', 'one hundred and twenty-three'],
    ['1000', 'one thousand'], ['-42', 'negative forty-two'],
    ['  0012  ', 'twelve'], ['-0', 'zero'],
    ['1000000', 'one million'], ['1000000000', 'one billion'],
  ])('converts %s', (input, expected) => {
    expect(convert(input)).toEqual({ error: '', output: expected });
  });
  it.each(['d', '12.5', '1,000', '1e3', '+1', '12abc', '-', '1\n2', '9007199254740992', '-9007199254740992'])('rejects %s', input => {
    expect(convert(input)).toEqual({ error: 'common.invalidNumber', output: '' });
  });
  it.each(['', '   '])('leaves empty input clear', input => {
    expect(convert(input)).toEqual({ error: '', output: '' });
  });
  it.each(['9007199254740991', '-9007199254740991'])('supports safe integer boundary %s', input => {
    const result = convert(input);
    expect(result.error).toBe('');
    expect(result.output).toContain('billion');
    expect(result.output).not.toMatch(/undefined|NaN/);
  });
});
