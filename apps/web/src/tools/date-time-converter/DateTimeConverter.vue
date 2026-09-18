<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert, NSelect } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
import { convertDate, type InputFormat } from './date-time-converter.service';

const inputFormatOptions: { label: string; value: InputFormat }[] = [
  { label: 'Auto-detect', value: 'auto' },
  { label: 'ISO 8601', value: 'iso8601' },
  { label: 'Unix Timestamp (s)', value: 'unix' },
  { label: 'Unix Timestamp (ms)', value: 'unix-ms' },
  { label: 'RFC 3339', value: 'rfc3339' },
  { label: 'UTC String', value: 'utc' },
  { label: 'Custom', value: 'custom' },
];

const input = ref('');
const inputFormat = ref<InputFormat>('auto');
const customFormat = ref('');

function setNow() {
  input.value = String(Math.floor(Date.now() / 1000));
  inputFormat.value = 'unix';
}

const conversionResult = computed(() => {
  return convertDate(input.value, inputFormat.value, customFormat.value || undefined);
});

function copyText(text: string) {
  navigator.clipboard.writeText(text);
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Input">
        <NSpace vertical :size="12">
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <NInput v-model:value="input" placeholder="Enter date string or timestamp..." clearable style="flex: 1; min-width: 200px;" />
            <NSelect v-model:value="inputFormat" :options="inputFormatOptions" style="width: 200px;" />
            <NButton @click="setNow" size="medium">Now</NButton>
          </div>
          <div v-if="inputFormat === 'custom'" style="display: flex; gap: 12px; align-items: center;">
            <NInput v-model:value="customFormat" placeholder="Custom format (e.g. YYYY/MM/DD HH:mm)" clearable style="flex: 1;" />
          </div>
        </NSpace>
      </NCard>

      <NAlert v-if="conversionResult.error" type="error" :title="conversionResult.error" />

      <NCard v-if="conversionResult.results.length > 0" title="Output">
        <NSpace vertical :size="8">
          <div v-for="r in conversionResult.results" :key="r.label" style="display: flex; align-items: center; gap: 12px;">
            <span style="width: 160px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">{{ r.label }}</span>
            <NInput :value="r.value" readonly style="flex: 1;" @click="copyText(r.value)" />
            <NButton size="small" @click="copyText(r.value)">Copy</NButton>
          </div>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
