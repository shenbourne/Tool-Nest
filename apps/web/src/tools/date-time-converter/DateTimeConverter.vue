<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert, NSelect } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import DateTimePicker from '@/components/DateTimePicker.vue';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
import { convertDate, type InputFormat } from './date-time-converter.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();

const inputFormatOptions = computed<{ label: string; value: InputFormat }[]>(() => [
  { label: t('tools.dateTimeConverter.autoDetect'), value: 'auto' },
  { label: 'ISO 8601', value: 'iso8601' },
  { label: t('tools.dateTimeConverter.unixSeconds'), value: 'unix' },
  { label: t('tools.dateTimeConverter.unixMilliseconds'), value: 'unix-ms' },
  { label: 'RFC 3339', value: 'rfc3339' },
  { label: t('tools.dateTimeConverter.utcString'), value: 'utc' },
  { label: t('tools.dateTimeConverter.custom'), value: 'custom' },
]);

const input = ref('');
const inputFormat = ref<InputFormat>('auto');
const customFormat = ref('');
const selectedDate = ref<number | null>(null);

function selectDate(value: number | null) {
  selectedDate.value = value;
  if (value === null) return;
  input.value = new Date(value).toISOString();
  inputFormat.value = 'iso8601';
}

function setNow() {
  input.value = String(Math.floor(Date.now() / 1000));
  inputFormat.value = 'unix';
}

const conversionResult = computed(() => {
  return convertDate(input.value, inputFormat.value, customFormat.value || undefined);
});

function copyText(text: string) {
  copyToClipboard(text);
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('common.input')">
        <NSpace vertical :size="12">
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <NInput v-model:value="input" :placeholder="t('tools.dateTimeConverter.inputPlaceholder')" clearable style="flex: 1; min-width: 200px;"  :input-props="{ id: 'dateTimeConverterField0' }"/>
            <NSelect v-model:value="inputFormat" :options="inputFormatOptions" style="width: 200px;" />
            <NButton @click="setNow" size="medium">{{ t('tools.dateTimeConverter.now') }}</NButton>
          </div>
          <DateTimePicker :value="selectedDate" @update:value="selectDate" />
          <div v-if="inputFormat === 'custom'" style="display: flex; gap: 12px; align-items: center;">
            <NInput v-model:value="customFormat" :placeholder="t('tools.dateTimeConverter.customFormatPlaceholder')" clearable style="flex: 1;"  :input-props="{ id: 'dateTimeConverterField1' }"/>
          </div>
        </NSpace>
      </NCard>

      <NAlert v-if="conversionResult.error" type="error" :title="conversionResult.error" />

      <NCard v-if="conversionResult.results.length > 0" :title="t('common.output')">
        <NSpace vertical :size="8">
          <div v-for="r in conversionResult.results" :key="r.label" style="display: flex; align-items: center; gap: 12px;">
            <span style="width: 160px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">{{ r.label }}</span>
            <NInput :value="r.value" readonly style="flex: 1;" @click="copyText(r.value)"  :input-props="{ id: 'dateTimeConverterField2' }"/>
            <NButton size="small" @click="copyText(r.value)">{{ t('tool.copy') }}</NButton>
          </div>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
