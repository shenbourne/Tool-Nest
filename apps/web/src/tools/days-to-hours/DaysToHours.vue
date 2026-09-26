<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const output = computed(() => {
  const d = parseFloat(input.value);
  if (isNaN(d)) return '';
  const h = d * 24; const m = h * 60; const s = m * 60;
  return d + ' ' + t('common.days') + ' =\n' + h + ' ' + t('common.hours') + '\n' + m + ' ' + t('common.minutes') + '\n' + s + ' ' + t('common.seconds');
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
