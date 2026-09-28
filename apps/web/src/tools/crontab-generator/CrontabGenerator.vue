<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert, NDataTable, NTag, NDivider } from 'naive-ui';
import type { DataTableColumn } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { CRON_FIELDS, validateField, buildCronExpression, describeCron, getNextExecutions } from './crontab-generator.service';

const { t } = useI18n();
const tool = useCurrentTool();

const fields = ref<string[]>(['40', '*', '*', '*', '*']);

const fieldValid = computed(() =>
  fields.value.map((f, i) => validateField(f, CRON_FIELDS[i].min, CRON_FIELDS[i].max))
);

const isCronValid = computed(() => fieldValid.value.every(Boolean));

const cronExpression = computed(() => buildCronExpression(fields.value));

const description = computed(() => {
  if (!isCronValid.value) return '';
  return describeCron(fields.value);
});

const nextExecutions = computed(() => {
  if (!isCronValid.value) return [];
  return getNextExecutions(fields.value, 5).map(d => d.toLocaleString());
});

const executionColumns: DataTableColumn<{ index: number; time: string }>[] = [
  { title: '#', key: 'index', width: 60 },
  { title: t('tools.crontabGenerator.nextExecution'), key: 'time' },
];

const executionData = computed(() =>
  nextExecutions.value.map((time, i) => ({ index: i + 1, time }))
);

const syntaxHelpers = computed(() => [
  { symbol: '*', meaning: t('tools.crontabGenerator.anyValue'), example: '* * * * *' },
  { symbol: '-', meaning: t('tools.crontabGenerator.rangeOfValues'), example: '1-5 * * * *' },
  { symbol: ',', meaning: t('tools.crontabGenerator.listOfValues'), example: '1,3,5 * * * *' },
  { symbol: '/', meaning: t('tools.crontabGenerator.stepValues'), example: '*/5 * * * *' },
]);
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.crontabGenerator.cronFields')">
        <NSpace vertical :size="12">
          <div v-for="(field, i) in fields" :key="i" style="display: flex; align-items: center; gap: 12px;">
            <span style="min-width: 130px; font-weight: 500;">{{ CRON_FIELDS[i].name }}</span>
            <NInput
              :value="fields[i]"
              @update:value="(v: string) => fields[i] = v"
              :placeholder="`${CRON_FIELDS[i].min}-${CRON_FIELDS[i].max}`"
              style="flex: 1; font-family: monospace;"
              :status="fieldValid[i] ? undefined : 'error'"
             :input-props="{ id: 'crontabGeneratorField0' }"/>
            <span style="min-width: 80px; color: var(--color-text-3); font-size: 12px;">
              {{ CRON_FIELDS[i].min }} - {{ CRON_FIELDS[i].max }}
            </span>
          </div>
        </NSpace>
      </NCard>

      <NCard :title="t('tools.crontabGenerator.cronExpression')">
        <div style="text-align: center; font-size: 24px; font-family: monospace; padding: 12px 0;">
          <NTag v-if="isCronValid" type="success" size="large">{{ cronExpression }}</NTag>
          <NTag v-else type="error" size="large">{{ t('tools.crontabGenerator.invalidCronExpression') }}</NTag>
        </div>
        <div v-if="description" style="text-align: center; font-size: 16px; opacity: 0.8; margin-top: 8px;">
          {{ description }}
        </div>
      </NCard>

      <NCard v-if="isCronValid && nextExecutions.length > 0" :title="t('tools.crontabGenerator.nextExecutionTimes')">
        <NDataTable
          :columns="executionColumns"
          :data="executionData"
          :bordered="false"
          :single-line="false"
          size="small"
        />
      </NCard>

      <NDivider />

      <NCard :title="t('tools.crontabGenerator.syntaxReference')">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">
          <div v-for="h in syntaxHelpers" :key="h.symbol" style="padding: 8px; border: 1px solid var(--color-hairline); border-radius: 6px;">
            <div><strong>{{ h.symbol }}</strong> — {{ h.meaning }}</div>
            <div style="font-family: monospace; font-size: 12px; opacity: 0.7; margin-top: 4px;">{{ h.example }}</div>
          </div>
        </div>
        <div style="margin-top: 16px; font-family: monospace; font-size: 12px; opacity: 0.7;">
          <pre style="margin: 0;">{{ t('tools.crontabGenerator.syntaxDiagram') }}</pre>
        </div>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
