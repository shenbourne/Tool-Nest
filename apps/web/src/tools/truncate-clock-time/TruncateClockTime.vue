<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const output = computed(() => {
  const parts = input.value.trim().split(':').map(Number);
  if (parts.some(isNaN)) return t('common.enterTimeAsHhMmSs');
  const [h=0, m=0, s=0] = parts;
  return [
    String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') + ' ' + t('tools.truncateClockTime.original'),
    String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':00 ' + t('tools.truncateClockTime.toMinute'),
    String(h).padStart(2,'0') + ':00:00 ' + t('tools.truncateClockTime.toHour'),
  ].join('\n');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')" />
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')" />
    </NSpace></NCard>
  </ToolLayout>
</template>
