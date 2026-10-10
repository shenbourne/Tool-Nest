<script setup lang="ts">
import { ref, computed } from 'vue';
import { NDatePicker, NFormItem, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import TimeToolPanel from '../date-time/TimeToolPanel.vue';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();

// `toISOString` is UTC, but a "YYYY-MM-DDTHH:mm" value without an offset is
// parsed as local time — seeding the field from UTC shifted every default
// timestamp by one timezone. Build the local equivalent instead.
function toLocalDateTimeInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
const input = ref(toLocalDateTimeInput(new Date()));
const FORMATS = computed(() => [
  ['t', t('tools.discordTimestamp.shortTime')],
  ['T', t('tools.discordTimestamp.longTime')],
  ['d', t('tools.discordTimestamp.shortDate')],
  ['D', t('tools.discordTimestamp.longDate')],
  ['f', t('tools.discordTimestamp.shortDateTime')],
  ['F', t('tools.discordTimestamp.longDateTime')],
  ['R', t('tools.discordTimestamp.relative')],
]);
const dateError = computed(() => (input.value.trim() && isNaN(new Date(input.value).getTime()) ? t('common.invalidDate') : ''));
const output = computed(() => {
  const d = new Date(input.value);
  if (isNaN(d.getTime())) return '';
  const unix = Math.floor(d.getTime()/1000);
  return FORMATS.value.map(([f,label]) => '<t:' + unix + ':' + f + '>  (' + label + ')').join('\n');
});
const results = computed(() => {
  if (!output.value) return [];
  const unix = Math.floor(new Date(input.value).getTime() / 1000);
  return FORMATS.value.map(([format, label]) => ({ label, value: '<t:' + unix + ':' + format + '>' }));
});
</script>
<template>
  <ToolLayout :tool="tool">
    <TimeToolPanel :results="results">
      <NFormItem :show-feedback="false" :label="t('tools.dateTime.dateTime')"><NDatePicker v-model:formatted-value="input" type="datetime" value-format="yyyy-MM-dd'T'HH:mm:ss" format="yyyy-MM-dd HH:mm:ss" :clearable="false" style="width: 100%;" /></NFormItem>
      <template #feedback><NAlert v-if="dateError" type="error">{{ dateError }}</NAlert><small v-else>{{ t('tools.dateTime.localTime') }}</small></template>
    </TimeToolPanel>
  </ToolLayout>
</template>
