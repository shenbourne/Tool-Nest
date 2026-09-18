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
  { title: 'Next Execution', key: 'time' },
];

const executionData = computed(() =>
  nextExecutions.value.map((time, i) => ({ index: i + 1, time }))
);

const syntaxHelpers = [
  { symbol: '*', meaning: 'Any value', example: '* * * * *' },
  { symbol: '-', meaning: 'Range of values', example: '1-5 * * * *' },
  { symbol: ',', meaning: 'List of values', example: '1,3,5 * * * *' },
  { symbol: '/', meaning: 'Step values', example: '*/5 * * * *' },
];
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Cron Fields">
        <NSpace vertical :size="12">
          <div v-for="(field, i) in fields" :key="i" style="display: flex; align-items: center; gap: 12px;">
            <span style="min-width: 130px; font-weight: 500;">{{ CRON_FIELDS[i].name }}</span>
            <NInput
              :value="fields[i]"
              @update:value="(v: string) => fields[i] = v"
              :placeholder="`${CRON_FIELDS[i].min}-${CRON_FIELDS[i].max}`"
              style="flex: 1; font-family: monospace;"
              :status="fieldValid[i] ? undefined : 'error'"
            />
            <span style="min-width: 80px; color: #999; font-size: 12px;">
              {{ CRON_FIELDS[i].min }} - {{ CRON_FIELDS[i].max }}
            </span>
          </div>
        </NSpace>
      </NCard>

      <NCard title="Cron Expression">
        <div style="text-align: center; font-size: 24px; font-family: monospace; padding: 12px 0;">
          <NTag v-if="isCronValid" type="success" size="large">{{ cronExpression }}</NTag>
          <NTag v-else type="error" size="large">Invalid cron expression</NTag>
        </div>
        <div v-if="description" style="text-align: center; font-size: 16px; opacity: 0.8; margin-top: 8px;">
          {{ description }}
        </div>
      </NCard>

      <NCard v-if="isCronValid && nextExecutions.length > 0" title="Next Execution Times">
        <NDataTable
          :columns="executionColumns"
          :data="executionData"
          :bordered="false"
          :single-line="false"
          size="small"
        />
      </NCard>

      <NDivider />

      <NCard title="Syntax Reference">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">
          <div v-for="h in syntaxHelpers" :key="h.symbol" style="padding: 8px; border: 1px solid #333; border-radius: 6px;">
            <div><strong>{{ h.symbol }}</strong> — {{ h.meaning }}</div>
            <div style="font-family: monospace; font-size: 12px; opacity: 0.7; margin-top: 4px;">{{ h.example }}</div>
          </div>
        </div>
        <div style="margin-top: 16px; font-family: monospace; font-size: 12px; opacity: 0.7;">
          <pre style="margin: 0;">
┌──────────── minute (0 - 59)
| ┌────────── hour (0 - 23)
| | ┌──────── day of month (1 - 31)
| | | ┌────── month (1 - 12)
| | | | ┌──── day of week (0 - 6, Sunday = 0)
| | | | |
* * * * *</pre>
        </div>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
