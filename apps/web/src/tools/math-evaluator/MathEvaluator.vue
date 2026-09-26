<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

// Safe recursive descent math expression parser — no eval/Function
function parseMath(expr: string): number {
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
      else if (s[pos] === '/') { pos++; const d = parsePower(); if (d === 0) throw new Error(t('tools.mathEvaluator.divisionByZero')); result /= d; }
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
    return parsePrimary();
  }

  function parsePrimary(): number {
    if (s[pos] === '(') {
      pos++;
      const result = parseExpression();
      if (s[pos] !== ')') throw new Error(t('tools.mathEvaluator.missingClosingParenthesis'));
      pos++;
      return result;
    }
    // Parse number
    const start = pos;
    while (pos < s.length && (s[pos] >= '0' && s[pos] <= '9' || s[pos] === '.')) pos++;
    if (pos === start) throw new Error(t('tools.mathEvaluator.unexpectedCharacter', { char: s[pos] || t('tools.mathEvaluator.endOfInput') }));
    return parseFloat(s.substring(start, pos));
  }

  const result = parseExpression();
  if (pos < s.length) throw new Error(t('tools.mathEvaluator.unexpectedCharacter', { char: s[pos] }));
  return result;
}

const expr = ref('2 * (3 + 4) ^ 2');
const result = computed(() => {
  try {
    if (!expr.value.trim()) return '';
    return String(parseMath(expr.value));
  } catch (e: any) { return t('tools.mathEvaluator.errorPrefix', { message: e.message }); }
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="expr" :placeholder="t('tools.mathEvaluator.expressionPlaceholder')" size="large" />
      <div style="font-size: 24px; font-weight: 700; text-align: center; padding: 16px;">{{ result }}</div>
      <NAlert type="info" :title="t('tools.mathEvaluator.supportedOperators')">{{ t('tools.mathEvaluator.operatorsList') }}</NAlert>
    </NSpace></NCard>
  </ToolLayout>
</template>
