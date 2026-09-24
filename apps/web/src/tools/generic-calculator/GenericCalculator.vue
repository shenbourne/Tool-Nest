<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NInput, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const expr = ref('');
const result = ref('');
const history = ref<string[]>([]);
function safeEval(s: string): number {
  let pos = 0; const str = s.replace(/\s+/g, '');
  function parseExpr(): number {
    let v = parseTerm();
    while (pos < str.length && (str[pos] === '+' || str[pos] === '-')) {
      const op = str[pos++]; const r = parseTerm(); v = op === '+' ? v + r : v - r;
    } return v;
  }
  function parseTerm(): number {
    let v = parsePower();
    while (pos < str.length && (str[pos] === '*' || str[pos] === '/' || str[pos] === '%')) {
      const op = str[pos++]; const r = parsePower();
      v = op === '*' ? v * r : op === '/' ? v / r : v % r;
    } return v;
  }
  function parsePower(): number {
    let v = parseUnary();
    if (pos < str.length && str[pos] === '^') { pos++; v = Math.pow(v, parsePower()); }
    return v;
  }
  function parseUnary(): number {
    if (str[pos] === '-') { pos++; return -parseUnary(); }
    if (str[pos] === '+') { pos++; return parseUnary(); }
    return parsePrimary();
  }
  function parsePrimary(): number {
    if (str[pos] === '(') { pos++; const v = parseExpr(); if (str[pos] === ')') pos++; return v; }
    let num = '';
    while (pos < str.length && (str[pos] >= '0' && str[pos] <= '9' || str[pos] === '.')) num += str[pos++];
    if (!num) throw new Error(t('tools.genericCalculator.unexpected', { char: str[pos] || t('tools.genericCalculator.endOfInput') }));
    return parseFloat(num);
  }
  const r = parseExpr();
  if (pos < str.length) throw new Error(t('tools.genericCalculator.unexpected', { char: str[pos] }));
  return r;
}
function calc() {
  try { result.value = String(safeEval(expr.value)); history.value.unshift(expr.value + ' = ' + result.value); if (history.value.length > 10) history.value.pop(); }
  catch (e: any) { result.value = t('tools.genericCalculator.errorPrefix', { message: e.message }); }
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="expr" :placeholder="t('tools.genericCalculator.expressionPlaceholder', { example: '2+3*4' })" @keyup.enter="calc" />
      <NButton type="primary" @click="calc">{{ t('common.calculate') }}</NButton>
      <NInput :value="result" readonly :placeholder="t('tools.genericCalculator.resultPlaceholder')" />
      <div v-if="history.length" style="opacity:0.7;font-size:13px;">{{ t('tools.genericCalculator.history') }}<br/><span v-for="h in history">{{ h }}<br/></span></div>
    </NSpace></NCard>
  </ToolLayout>
</template>
