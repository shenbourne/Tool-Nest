<script setup lang="ts">
import { NButton, NCard, NEmpty } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useCopy } from '@/composables/useCopy';
defineProps<{ results: { label: string; value: string }[] }>();
const { t } = useI18n();
const { copyToClipboard } = useCopy();
</script>
<template>
  <NCard class="time-panel">
    <div class="time-form"><slot /></div>
    <div class="time-feedback"><slot name="feedback" /></div>
    <section class="time-results" aria-live="polite">
      <div class="results-heading"><h2>{{ t('tools.dateTime.results') }}</h2><NButton v-if="results.length" size="small" secondary @click="copyToClipboard(results.map(row => row.label + ': ' + row.value).join('\n'))">{{ t('tools.dateTime.copyAll') }}</NButton></div>
      <NEmpty v-if="!results.length" :description="t('tools.dateTime.empty')" />
      <div v-for="row in results" :key="row.label" class="result-row">
        <span class="result-label">{{ row.label }}</span><output>{{ row.value }}</output>
        <NButton size="small" quaternary :aria-label="t('tools.dateTime.copyResult', { label: row.label })" @click="copyToClipboard(row.value)">{{ t('tool.copy') }}</NButton>
      </div>
    </section>
  </NCard>
</template>
<style scoped>
.time-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 16px; }
.time-form :deep(.n-form-item) { margin: 0; }
.time-feedback { margin-top: 12px; }
.time-feedback:empty { display: none; }
.time-results { border-top: 1px solid var(--color-hairline); margin-top: 24px; padding-top: 16px; }
.results-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
h2 { margin: 0; font-size: 16px; font-weight: 600; }
.result-row { display: grid; grid-template-columns: minmax(110px, 1fr) minmax(0, 2fr) auto; align-items: center; gap: 16px; padding: 12px 0; }
.result-row + .result-row { border-top: 1px solid var(--color-hairline); }
.result-label { color: var(--color-text-3); }
output { font-variant-numeric: tabular-nums; overflow-wrap: anywhere; white-space: pre-wrap; font-size: 16px; }
@media (max-width: 540px) { .result-row { grid-template-columns: minmax(0, 1fr) auto; gap: 6px 12px; } .result-label { grid-column: 1 / -1; } }
</style>
