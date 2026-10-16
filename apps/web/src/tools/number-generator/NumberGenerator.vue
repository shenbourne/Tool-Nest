<script setup lang="ts">
import { computed, ref } from 'vue';
import { NInput, NInputNumber, NRadioGroup, NRadioButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTabs from '@/components/ToolTabs.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { generateNumbers, sequenceCountLimit, MAX_SEQUENCE_START, type NumberSequenceType } from './number-generator.service';
import { tool } from './index';
const { t } = useI18n();
const type = ref<NumberSequenceType>('fibonacci');
const count = ref<number | null>(10);
const start = ref<number | null>(0);
const difference = ref<number | null>(3);
const arithmetic = computed(() => type.value === 'arithmetic' || type.value === 'geometric');
const ratio = ref<number | null>(2);
const factor = computed(() => type.value === 'geometric' ? ratio.value : difference.value);
const source = ref('generated');
const custom = ref('');
const statistics = computed(() => {
 const values = (source.value === 'generated' ? output.value : custom.value).split(/[\s,，;；]+/).filter(Boolean).map(Number).filter(Number.isFinite).sort((a,b) => a-b);
 if (!values.length) return [];
 const total = values.reduce((a,b) => a+b, 0);
 const mid = Math.floor(values.length / 2);
 return [
 ['common.count', values.length], ['tools.numberGenerator.total', total],
 ['tools.numberSum.average', total / values.length], ['common.min', values[0]],
 ['common.max', values[values.length - 1]], ['tools.numberSum.median', values.length % 2 ? values[mid] : values[mid-1]/2 + values[mid]/2],
 ].map(([label, value]) => ({ label: String(label), value: Number(value) }));
});
const options: { value: NumberSequenceType; preview: string }[] = [
  { value: 'fibonacci', preview: '0, 1, 1, 2, 3, 5…' },
  { value: 'primes', preview: '2, 3, 5, 7, 11…' },
  { value: 'arithmetic', preview: '0, 3, 6, 9, 12…' },
  { value: 'geometric', preview: '1, 2, 4, 8…' },
];
const tabs = computed(() => options.map(option => ({ name: option.value, label: t(`tools.numberGenerator.${option.value}`) })));
const validStart = computed(() => start.value !== null && (arithmetic.value ? Number.isFinite(start.value) : Number.isInteger(start.value) && start.value >= 0 && start.value <= MAX_SEQUENCE_START));
const limit = computed(() => sequenceCountLimit(type.value, start.value ?? 0));
const valid = computed(() => validStart.value && (!arithmetic.value || (factor.value !== null && Number.isFinite(factor.value))) && count.value !== null && Number.isInteger(count.value) && count.value >= 1 && count.value <= limit.value);
const output = computed(() => valid.value && count.value !== null
  ? generateNumbers(type.value, count.value, start.value ?? 0, factor.value ?? NaN) ?? '' : '');
</script>
<template>
  <ToolLayout :tool="tool">
    <div class="sequence-tool">
      <ToolTabs v-model:value="type" :tabs="tabs" :aria-label="t('tools.numberGenerator.sequenceType')">
      <section class="sequence-settings" :aria-label="t('tools.numberGenerator.parameters')">
        <h2>{{ t('tools.numberGenerator.parameters') }}</h2>
        <div class="sequence-controls">
          <div class="count-field">
            <label for="sequence-start">{{ t(arithmetic ? 'tools.arithmeticSequence.firstTerm' : 'tools.numberGenerator.startLabel') }}</label>
            <NInputNumber v-model:value="start" :min="arithmetic ? undefined : 0" :max="arithmetic ? undefined : MAX_SEQUENCE_START" :update-value-on-input="true"
              :input-props="{ id: 'sequence-start', 'aria-describedby': 'sequence-start-hint' }" />
            <span id="sequence-start-hint" class="count-hint">{{ t(arithmetic ? 'tools.numberGenerator.arithmeticHint' : 'tools.numberGenerator.startHint') }}</span>
          </div>
          <div v-if="type === 'arithmetic'" class="count-field">
            <label for="sequence-difference">{{ t('tools.arithmeticSequence.difference') }}</label>
            <NInputNumber v-model:value="difference" :update-value-on-input="true" :input-props="{ id: 'sequence-difference' }" />
          </div>
          <div v-if="type === 'geometric'" class="count-field">
            <label for="sequence-ratio">{{ t('tools.numberGenerator.ratio') }}</label>
            <NInputNumber v-model:value="ratio" :update-value-on-input="true" :input-props="{ id: 'sequence-ratio' }" />
          </div>
          <div class="count-field">
            <label for="sequence-count">{{ t('tools.numberGenerator.countLabel') }}</label>
            <NInputNumber v-model:value="count" :min="1" :max="limit" :update-value-on-input="true"
              :input-props="{ id: 'sequence-count', 'aria-describedby': 'sequence-count-hint' }" />
            <span id="sequence-count-hint" class="count-hint">{{ t('tools.numberGenerator.range', { max: limit }) }}</span>
          </div>
        </div>
      </section>
      </ToolTabs>
      <section class="sequence-result" :aria-label="t('tools.numberGenerator.result')">
        <div class="result-heading">
          <h2>{{ t('tools.numberGenerator.result') }}</h2>
          <span class="result-meta">{{ t(`tools.numberGenerator.${type}`) }} · {{ t('tools.numberGenerator.items', { count: valid ? count : 0 }) }}</span>
        </div>
        <p role="status">{{ arithmetic && !valid ? t('tools.numberGenerator.invalidArithmetic') : !validStart ? t('tools.numberGenerator.invalidStart', { max: MAX_SEQUENCE_START }) : valid && !output ? t('tools.numberGenerator.invalidArithmetic') : valid ? t('tools.numberGenerator.ready') : t('tools.numberGenerator.invalidCount', { max: limit }) }}</p>
        <ToolTextPanel :input-text="''" :output-text="output" export-name="numbers.txt" hide-input>
          <template #output>
            <NInput :value="output" type="textarea" :rows="7" readonly :input-props="{ 'aria-label': t('tools.numberGenerator.result') }" />
          </template>
        </ToolTextPanel>
      </section>
      <section class="sequence-statistics" :aria-label="t('tools.numberGenerator.statistics')">
        <h2>{{ t('tools.numberGenerator.statistics') }}</h2>
        <NRadioGroup v-model:value="source" :aria-label="t('tools.numberGenerator.statisticsSource')" class="statistics-source">
          <NRadioButton value="generated">{{ t('tools.numberGenerator.result') }}</NRadioButton>
          <NRadioButton value="custom">{{ t('tools.numberGenerator.customNumbers') }}</NRadioButton>
        </NRadioGroup>
        <NInput v-if="source === 'custom'" v-model:value="custom" type="textarea" :rows="4" :placeholder="t('tools.numberGenerator.customHint')" :input-props="{ 'aria-label': t('tools.numberGenerator.customNumbers') }" />
        <dl v-if="statistics.length" class="statistics-grid">
          <div v-for="stat in statistics" :key="stat.label"><dt>{{ t(stat.label) }}</dt><dd>{{ Number.isFinite(stat.value) ? stat.value : t('tools.numberGenerator.overflow') }}</dd></div>
        </dl>
        <p v-else>{{ t('tools.numberGenerator.emptyStatistics') }}</p>
      </section>
    </div>
  </ToolLayout>
</template>
<style scoped>
.sequence-tool { display: grid; gap: 24px; }
.sequence-settings, .sequence-result, .sequence-statistics { padding: 24px; border: 1px solid var(--color-hairline); border-radius: 12px; background: var(--color-canvas); }
h2 { margin: 0; color: var(--color-ink); font-size: 16px; font-weight: 600; }
p { margin: 6px 0 16px; color: var(--color-text-2); font-size: 13px; }
.sequence-controls { display: flex; flex-wrap: wrap; align-items: start; gap: 24px; margin-top: 16px; }
.count-field { display: grid; grid-template-columns: auto 150px; align-items: center; gap: 8px 16px; }
.count-field label { font-weight: 500; }
.count-hint { white-space: nowrap; grid-column: 2; font-size: 12px; color: var(--color-text-2); }
.result-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.result-meta { padding: 4px 10px; border-radius: 999px; color: var(--color-primary); background: var(--color-primary-soft); font-size: 12px; }
.sequence-result :deep(textarea) { font-family: var(--font-family-mono); line-height: 1.9; }
.statistics-source { margin: 16px 0; }
.statistics-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-bottom: 0; }
.statistics-grid div { padding: 12px; border-radius: 8px; background: var(--color-surface-soft); min-width: 0; }
dt { color: var(--color-text-2); font-size: 13px; }
dd { margin: 6px 0 0; font-family: var(--font-family-mono); overflow-wrap: anywhere; }
@media (max-width: 700px) { .statistics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 480px) { .sequence-settings, .sequence-result, .sequence-statistics { padding: 16px; } .sequence-controls { align-items: stretch; flex-direction: column; } .count-field { grid-template-columns: auto minmax(0, 1fr); } }
</style>
