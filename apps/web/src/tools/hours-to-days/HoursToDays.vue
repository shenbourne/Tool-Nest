<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const error = computed(() => {
  const v = input.value.trim();
  return v && !/^\d+(\.\d+)?$/.test(v) ? t('common.invalidNumber') : '';
});
const output = computed(() => {
  if (error.value) return '';
  const h = parseFloat(input.value);
  if (isNaN(h)) return '';
  const d = Math.floor(h / 24); const rem = h % 24;
  return h + ' ' + t('common.hours') + ' = ' + d + ' ' + t('common.days') + ' ' + rem + ' ' + t('common.hours');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')" />
      <NAlert v-if="error" type="error" :title="error" />
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')" />
    </NSpace></NCard>
  </ToolLayout>
</template>
