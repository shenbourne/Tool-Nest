import { describe, expect, it } from 'vitest';
import { evaluateExpression } from './generic-calculator.service';

describe('unified calculator', () => {
  it('evaluates factorial with parentheses and power', () => {
    expect(evaluateExpression('0!')).toBe(1);
    expect(evaluateExpression('(2+3)!')).toBe(120);
    expect(evaluateExpression('2*3!^2')).toBe(72);
  });
  it('rejects unfinished parentheses and invalid factorials', () => {
    for (const expression of ['(2+3', '(-1)!', '1.5!', '171!', '5%0']) {
      expect(() => evaluateExpression(expression)).toThrow();
    }
  });
});
