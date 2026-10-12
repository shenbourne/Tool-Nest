import { i18n } from '@/i18n';

/**
 * Safe recursive-descent math expression parser — no eval/Function.
 * Returns the numeric value or throws with a localized message.
 */
export function evaluateExpression(expr: string): number {
  let pos = 0;
  const s = expr.replace(/\s+/g, '');

  function parseExpression(): number {
    let result = parseTerm();
    while (pos < s.length) {
      if (s[pos] === '+') { pos++; result += parseTerm(); }
      else if (s[pos] === '-') { pos++; result -= parseTerm(); }
      else break;
    }
    return result;
  }

  function parseTerm(): number {
    let result = parsePower();
    while (pos < s.length) {
      if (s[pos] === '*') { pos++; result *= parsePower(); }
      else if (s[pos] === '/') { pos++; const d = parsePower(); if (d === 0) throw new Error(i18n.global.t('tools.genericCalculator.divisionByZero')); result /= d; }
      else if (s[pos] === '%') { pos++; result %= parsePower(); }
      else break;
    }
    return result;
  }

  function parsePower(): number {
    let result = parseUnary();
    if (pos < s.length && s[pos] === '^') {
      pos++;
      result = Math.pow(result, parsePower()); // right-associative
    }
    return result;
  }

  function parseUnary(): number {
    if (s[pos] === '-') { pos++; return -parseUnary(); }
    if (s[pos] === '+') { pos++; return parseUnary(); }
    let value = parsePrimary();
    while (s[pos] === '!') {
      pos++;
      if (!Number.isInteger(value) || value < 0 || value > 170) throw new Error(i18n.global.t('tools.genericCalculator.invalidFactorial'));
      let factorial = 1;
      for (let n = 2; n <= value; n++) factorial *= n;
      value = factorial;
    }
    return value;
  }

  function parsePrimary(): number {
    if (s[pos] === '(') {
      pos++;
      const result = parseExpression();
      if (s[pos] !== ')') throw new Error(i18n.global.t('tools.genericCalculator.missingClosingParenthesis'));
      pos++;
      return result;
    }
    const start = pos;
    while (pos < s.length && (s[pos] >= '0' && s[pos] <= '9' || s[pos] === '.')) pos++;
    if (pos === start) throw new Error(i18n.global.t('tools.genericCalculator.unexpectedCharacter', { char: s[pos] || i18n.global.t('tools.genericCalculator.endOfInput') }));
    const numStr = s.substring(start, pos);
    // Reject malformed numbers like 1.2.3 instead of silently truncating
    // them via parseFloat.
    if (!/^\d+(\.\d+)?$/.test(numStr) && !/^\.\d+$/.test(numStr)) {
      throw new Error(i18n.global.t('tools.genericCalculator.unexpectedCharacter', { char: s[pos] || i18n.global.t('tools.genericCalculator.endOfInput') }));
    }
    return parseFloat(numStr);
  }

  const result = parseExpression();
  if (pos < s.length) throw new Error(i18n.global.t('tools.genericCalculator.unexpectedCharacter', { char: s[pos] }));
  if (!Number.isFinite(result)) throw new Error(i18n.global.t('tools.genericCalculator.notFinite'));
  return result;
}
