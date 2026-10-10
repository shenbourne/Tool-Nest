import { describe, expect, it } from 'vitest';
import { evaluateExpression as parseMath } from './generic-calculator.service';

describe('parseMath', () => {
  it('evaluates arithmetic with precedence and parentheses', () => {
    expect(parseMath('2 * (3 + 4) ^ 2')).toBe(98);
  });

  it('rejects numbers with multiple decimal points', () => {
    expect(() => parseMath('1.2.3')).toThrow();
    expect(() => parseMath('2..5')).toThrow();
  });

  it('rejects division by zero', () => {
    expect(() => parseMath('5/0')).toThrow();
    expect(() => parseMath('1/(3-3)')).toThrow();
  });

  it('handles decimals and unary minus', () => {
    expect(parseMath('1.5 + 2.25')).toBe(3.75);
    expect(parseMath('-3 + 1')).toBe(-2);
  });

  it('rejects trailing garbage', () => {
    expect(() => parseMath('2 +')).toThrow();
  });
});

