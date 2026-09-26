<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const output = computed(() => {
  const s = parseInt(input.value);
  if (isNaN(s)) return '';
  const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); const sec = s%60;
  return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
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
