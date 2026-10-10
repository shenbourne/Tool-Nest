import { describe, expect, it } from 'vitest';
import { evaluateExpression } from './generic-calculator.service';

describe('evaluateExpression', () => {
  it('evaluates with precedence', () => {
    expect(evaluateExpression('2+3*4')).toBe(14);
    expect(evaluateExpression('(2+3)*4')).toBe(20);
  });

  it('rejects numbers with multiple decimal points', () => {
    expect(() => evaluateExpression('1.2.3')).toThrow();
  });

  it('rejects trailing operators', () => {
    expect(() => evaluateExpression('2+')).toThrow();
  });

  it('produces Infinity for division by zero (handled by caller)', () => {
    expect(evaluateExpression('5/0')).toBe(Infinity);
  });
});
