<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { generateNumbers } from './number-generator.service';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const output = computed(() => {
  const lines = input.value.trim().split('\n');
  const type = lines[0]?.toLowerCase() || '';
  const n = parseInt(lines[1]) || 10;
  const result = generateNumbers(type, n);
  return result === null ? t('tools.numberGenerator.usageHint') : result;
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
