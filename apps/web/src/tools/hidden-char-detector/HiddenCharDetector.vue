<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const output = computed(() => {
  if (!input.value) return '';
  return input.value.split('').map((c, i) => {
    const code = c.charCodeAt(0);
    // Line feeds and carriage returns are ordinary formatting, not hidden
    // characters; reporting them makes every multiline paste look suspicious.
    if ((code < 32 && code !== 10 && code !== 13) || code === 127 || (code >= 0x200B && code <= 0x200F) || code === 0xFEFF || code === 0x00A0)
      return `[pos ${i}] U+${code.toString(16).toUpperCase().padStart(4,'0')} (${JSON.stringify(c)})`;
    return '';
  }).filter(Boolean).join('\n') || t('tools.hiddenCharDetector.noneDetected');
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
