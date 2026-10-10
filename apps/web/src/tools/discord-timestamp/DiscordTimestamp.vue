<script setup lang="ts">
import { ref, computed } from 'vue';
import { NDatePicker, NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
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
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="discord-timestamps.txt">
      <template #input>
        <NDatePicker v-model:formatted-value="input" type="datetime" value-format="yyyy-MM-dd'T'HH:mm:ss" format="yyyy-MM-dd HH:mm:ss" style="width: 100%;" />
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="8" readonly  :input-props="{ id: 'discordTimestampField1' }"/>
      </template>
      <template #params>
        <NAlert v-if="dateError" type="error" :title="dateError" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
