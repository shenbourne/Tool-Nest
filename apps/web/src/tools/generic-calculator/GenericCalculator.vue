<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { NButton, NCard, NInput } from 'naive-ui';
import { useStorage } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { evaluateExpression } from './generic-calculator.service';
import { tool } from './index';
const { t } = useI18n();
const expression = ref('');
const input = ref<InstanceType<typeof NInput> | null>(null);
type Entry = { expression: string; result: string };
const storedHistory = useStorage<unknown>('toolnest.calculator.history.v1', []);
const history = computed<Entry[]>(() => Array.isArray(storedHistory.value)
  ? storedHistory.value.filter((entry): entry is Entry => !!entry && typeof entry.expression === 'string' && typeof entry.result === 'string').slice(0, 100) : []);
const preview = computed(() => {
  if (!expression.value.trim()) return { result: '', error: '' };
  try { return { result: String(evaluateExpression(expression.value)), error: '' }; }
  catch (error) { return { result: '', error: error instanceof Error ? error.message : String(error) }; }
});
const keys = [
  ['(', '('], [')', ')'], ['n!', '!'], ['÷', '/'],
  ['7', '7'], ['8', '8'], ['9', '9'], ['×', '*'],
  ['4', '4'], ['5', '5'], ['6', '6'], ['−', '-'],
  ['1', '1'], ['2', '2'], ['3', '3'], ['+', '+'],
  ['+/−', 'sign'], ['0', '0'], ['.', '.'], ['=', '='],
];
const committed = ref(false);
function record() {
  if (!preview.value.result || preview.value.error) return;
  storedHistory.value = [{ expression: expression.value, result: preview.value.result }, ...history.value].slice(0, 100);
  committed.value = true;
}
async function press(value: string) {
  if (value === '=') { record(); return; }
  if (value === 'sign') {
    expression.value = expression.value.startsWith('-(') && expression.value.endsWith(')')
      ? expression.value.slice(2, -1) : expression.value ? `-(${expression.value})` : '-';
    committed.value = false; return;
  }
  const field = document.getElementById('calculator-expression') as HTMLInputElement | null;
  let start = field?.selectionStart ?? expression.value.length;
  let end = field?.selectionEnd ?? start;
  if (committed.value && /^[0-9.(]$/.test(value)) {
    expression.value = ''; start = 0; end = 0;
  } else if (committed.value && preview.value.result && value !== 'backspace') {
    expression.value = `(${preview.value.result})`; start = expression.value.length; end = start;
  }
  committed.value = false;
  if (value === 'backspace') {
    if (start === end) start = Math.max(0, start - 1);
    value = '';
  }
  expression.value = expression.value.slice(0, start) + value + expression.value.slice(end);
  await nextTick(); input.value?.focus();
  field?.setSelectionRange(start + value.length, start + value.length);
}
function reuse(entry: Entry) { expression.value = entry.expression; committed.value = false; input.value?.focus(); }
function clear() { expression.value = ''; committed.value = false; }
</script>
<template>
  <ToolLayout :tool="tool">
    <div class="calculator-layout">
      <NCard>
        <div class="calculator-main">
          <NInput ref="input" v-model:value="expression" size="large"
            :placeholder="t('tools.genericCalculator.expressionPlaceholder', { example: '2*(3+4)^2' })"
            :input-props="{ id: 'calculator-expression', 'aria-label': t('tools.genericCalculator.name') }"
            @input="committed = false" @keyup.enter="record" />
          <div class="calculator-result-row">
            <span class="calculator-error" role="status" :title="preview.error">{{ preview.error }}</span>
            <output class="calculator-result" aria-live="polite">{{ preview.result || '—' }}</output>
          </div>
          <div class="calculator-keypad calculator-actions">
            <NButton @click="clear">{{ t('tools.genericCalculator.clear') }}</NButton>
            <NButton @click="press('^')">xʸ</NButton><NButton @click="press('%')">%</NButton>
            <NButton :aria-label="t('tools.genericCalculator.backspace')" :title="t('tools.genericCalculator.backspace')" @click="press('backspace')">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-7-7 7-7Z" />
                <path d="m12 9 6 6m0-6-6 6" />
              </svg>
            </NButton>
          </div>
          <div class="calculator-keypad">
            <NButton v-for="[label, value] in keys" :key="value" :type="value === '=' ? 'primary' : 'default'"
              :disabled="value === '=' && (!preview.result || !!preview.error)"
              :aria-label="value === '=' ? t('tools.genericCalculator.equals') : value === 'sign' ? t('tools.genericCalculator.toggleSign') : label"
              @click="press(value)">{{ label }}</NButton>
          </div>
          <p class="calculator-hint">{{ t('tools.genericCalculator.operators') }}</p>
        </div>
      </NCard>
      <NCard :title="t('tools.genericCalculator.history')">
        <template #header-extra><NButton size="small" :disabled="!history.length" @click="storedHistory = []">{{ t('tools.genericCalculator.clearHistory') }}</NButton></template>
        <p class="calculator-hint">{{ t('tools.genericCalculator.historyHint') }}</p>
        <p v-if="!history.length" class="calculator-hint">{{ t('tools.genericCalculator.emptyHistory') }}</p>
        <ol v-else class="calculator-history">
          <li v-for="(entry, index) in history" :key="index">
            <button :aria-label="`${t('tools.genericCalculator.reuse')}: ${entry.expression}`" @click="reuse(entry)">
              <span>{{ entry.expression }}</span><strong>= {{ entry.result }}</strong>
            </button>
          </li>
        </ol>
      </NCard>
    </div>
  </ToolLayout>
</template>
<style scoped>
.calculator-layout { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 20px; }
.calculator-main { display: flex; flex-direction: column; gap: 14px; }
.calculator-result-row { display: flex; align-items: center; gap: 12px; height: 64px; }
.calculator-error { flex: 1; min-width: 0; color: #d97706; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.calculator-result { display: block; max-width: 65%; text-align: right; font-size: 32px; font-weight: 600; overflow-x: auto; white-space: nowrap; }
.calculator-keypad, .calculator-actions { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.calculator-keypad :deep(.n-button) { height: 62px; font-size: 24px; }
.calculator-actions { margin-bottom: -8px; }
.calculator-actions :deep(.n-button:first-child) { font-size: 16px; }
.calculator-hint { opacity: .65; font-size: 13px; margin: 0 0 12px; }
.calculator-history { list-style: none; padding: 0; margin: 0; max-height: 480px; overflow-y: auto; }
.calculator-history button { width: 100%; display: flex; flex-direction: column; gap: 6px; padding: 14px 8px; background: transparent; color: inherit; border: 0; border-bottom: 1px solid #8883; cursor: pointer; text-align: left; overflow-wrap: anywhere; }
.calculator-history button:hover { background: #8881; }
.calculator-history strong { align-self: flex-end; font-size: 18px; }
@media (max-width: 720px) { .calculator-layout { grid-template-columns: minmax(0, 1fr); } }
</style>
