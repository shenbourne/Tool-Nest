<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();

// `toISOString` is UTC, but a "YYYY-MM-DDTHH:mm" value without an offset is
// parsed as local time — seeding the field from UTC shifted every default
// timestamp by one timezone. Build the local equivalent instead.
function toLocalDateTimeInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
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
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" placeholder="YYYY-MM-DDTHH:mm"  :input-props="{ id: 'discordTimestampField0' }"/>
      <NAlert v-if="dateError" type="error" :title="dateError" />
      <NInput :value="output" type="textarea" :rows="8" readonly  :input-props="{ id: 'discordTimestampField1' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
