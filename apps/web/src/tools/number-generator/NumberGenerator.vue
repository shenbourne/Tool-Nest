<script setup lang="ts">
import { computed, ref } from 'vue';
import { NInput, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { generateNumbers, sequenceCountLimit, MAX_SEQUENCE_START, type NumberSequenceType } from './number-generator.service';
import { tool } from './index';
const { t } = useI18n();
const type = ref<NumberSequenceType>('fibonacci');
const count = ref<number | null>(10);
const start = ref<number | null>(0);
const options: { value: NumberSequenceType; preview: string }[] = [
  { value: 'fibonacci', preview: '0, 1, 1, 2, 3, 5…' },
  { value: 'primes', preview: '2, 3, 5, 7, 11…' },
  { value: 'even', preview: '0, 2, 4, 6, 8…' },
  { value: 'odd', preview: '1, 3, 5, 7, 9…' },
];
const validStart = computed(() => start.value !== null && Number.isInteger(start.value) && start.value >= 0 && start.value <= MAX_SEQUENCE_START);
const limit = computed(() => sequenceCountLimit(type.value, start.value ?? 0));
const valid = computed(() => validStart.value && count.value !== null && Number.isInteger(count.value) && count.value >= 1 && count.value <= limit.value);
const output = computed(() => valid.value && count.value !== null
  ? generateNumbers(type.value, count.value, start.value ?? 0) ?? '' : '');
</script>
<template>
  <ToolLayout :tool="tool">
    <div class="sequence-tool">
      <section class="sequence-settings" :aria-label="t('tools.numberGenerator.settings')">
        <h2>{{ t('tools.numberGenerator.settings') }}</h2>
        <p>{{ t('tools.numberGenerator.intro') }}</p>
        <div class="sequence-types" role="group" :aria-label="t('tools.numberGenerator.sequenceType')">
          <button v-for="option in options" :key="option.value" type="button" class="sequence-type"
            :class="{ selected: type === option.value }" :aria-pressed="type === option.value" @click="type = option.value">
            <span class="type-title">{{ t(`tools.numberGenerator.${option.value}`) }}<span class="selection-dot" aria-hidden="true" /></span>
            <span class="type-preview">{{ option.preview }}</span>
          </button>
        </div>
        <div class="sequence-controls">
          <div class="count-field">
            <label for="sequence-start">{{ t('tools.numberGenerator.startLabel') }}</label>
            <NInputNumber v-model:value="start" :min="0" :max="MAX_SEQUENCE_START" :update-value-on-input="true"
              :input-props="{ id: 'sequence-start', 'aria-describedby': 'sequence-start-hint' }" />
            <span id="sequence-start-hint" class="count-hint">{{ t('tools.numberGenerator.startHint') }}</span>
          </div>
          <div class="count-field">
            <label for="sequence-count">{{ t('tools.numberGenerator.countLabel') }}</label>
            <NInputNumber v-model:value="count" :min="1" :max="limit" :update-value-on-input="true"
              :input-props="{ id: 'sequence-count', 'aria-describedby': 'sequence-count-hint' }" />
            <span id="sequence-count-hint" class="count-hint">{{ t('tools.numberGenerator.range', { max: limit }) }}</span>
          </div>
        </div>
      </section>
      <section class="sequence-result" :aria-label="t('tools.numberGenerator.result')">
        <div class="result-heading">
          <h2>{{ t('tools.numberGenerator.result') }}</h2>
          <span class="result-meta">{{ t(`tools.numberGenerator.${type}`) }} · {{ t('tools.numberGenerator.items', { count: valid ? count : 0 }) }}</span>
        </div>
        <p role="status">{{ !validStart ? t('tools.numberGenerator.invalidStart', { max: MAX_SEQUENCE_START }) : valid ? t('tools.numberGenerator.ready') : t('tools.numberGenerator.invalidCount', { max: limit }) }}</p>
        <ToolTextPanel :input-text="''" :output-text="output" export-name="numbers.txt" hide-input>
          <template #output>
            <NInput :value="output" type="textarea" :rows="7" readonly :input-props="{ 'aria-label': t('tools.numberGenerator.result') }" />
          </template>
        </ToolTextPanel>
      </section>
    </div>
  </ToolLayout>
</template>
<style scoped>
.sequence-tool { display: grid; gap: 24px; }
.sequence-settings, .sequence-result { padding: 24px; border: 1px solid var(--color-hairline); border-radius: 12px; background: var(--color-canvas); }
h2 { margin: 0; color: var(--color-ink); font-size: 16px; font-weight: 600; }
p { margin: 6px 0 16px; color: var(--color-text-2); font-size: 13px; }
.sequence-types { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 20px; }
.sequence-type { padding: 16px; text-align: left; font: inherit; color: var(--color-ink); border: 1px solid var(--color-hairline); border-radius: 8px; background: var(--color-surface-soft); cursor: pointer; transition: border-color .15s, background .15s; }
.sequence-type:hover { border-color: var(--color-primary); }
.sequence-type:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 3px; }
.sequence-type.selected { border-color: var(--color-primary); background: var(--color-primary-soft); }
.type-title { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-weight: 600; }
.selection-dot { width: 8px; height: 8px; flex-shrink: 0; border-radius: 50%; background: var(--color-hairline-strong); }
.selected .selection-dot { background: var(--color-primary); }
.type-preview { display: block; margin-top: 8px; font: 12px/1.6 var(--font-family-mono); color: var(--color-text-2); }
.sequence-controls { display: flex; flex-wrap: wrap; align-items: start; gap: 24px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--color-hairline); }
.count-field { display: grid; grid-template-columns: auto 150px; align-items: center; gap: 8px 16px; }
.count-field label { font-weight: 500; }
.count-hint { white-space: nowrap; grid-column: 2; font-size: 12px; color: var(--color-text-2); }
.result-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.result-meta { padding: 4px 10px; border-radius: 999px; color: var(--color-primary); background: var(--color-primary-soft); font-size: 12px; }
.sequence-result :deep(textarea) { font-family: var(--font-family-mono); line-height: 1.9; }
@media (max-width: 700px) { .sequence-types { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 480px) { .sequence-settings, .sequence-result { padding: 16px; } .sequence-controls { align-items: stretch; flex-direction: column; } .count-field { grid-template-columns: auto minmax(0, 1fr); } .sequence-type { padding: 12px; } }
</style>
