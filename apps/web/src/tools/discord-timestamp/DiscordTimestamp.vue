<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref(new Date().toISOString().slice(0,16));
const FORMATS = computed(() => [
  ['t', t('tools.discordTimestamp.shortTime')],
  ['T', t('tools.discordTimestamp.longTime')],
  ['d', t('tools.discordTimestamp.shortDate')],
  ['D', t('tools.discordTimestamp.longDate')],
  ['f', t('tools.discordTimestamp.shortDateTime')],
  ['F', t('tools.discordTimestamp.longDateTime')],
  ['R', t('tools.discordTimestamp.relative')],
]);
const output = computed(() => {
  const d = new Date(input.value);
  if (isNaN(d.getTime())) return t('common.invalidDate');
  const unix = Math.floor(d.getTime()/1000);
  return FORMATS.value.map(([f,label]) => '<t:' + unix + ':' + f + '>  (' + label + ')').join('\n');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" placeholder="YYYY-MM-DDTHH:mm" />
      <NInput :value="output" type="textarea" :rows="8" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
