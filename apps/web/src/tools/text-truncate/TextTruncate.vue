<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NInputNumber, NSelect } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const limit = ref(100);
const mode = ref('chars');
const modeOptions = computed(() => [
  { label: t('tools.textTruncate.characters'), value: 'chars' },
  { label: t('tools.textTruncate.words'), value: 'words' },
  { label: t('tools.textTruncate.lines'), value: 'lines' },
]);
const output = computed(() => {
  if (mode.value === 'chars') return input.value.slice(0, limit.value);
  if (mode.value === 'words') return input.value.split(/\s+/).slice(0, limit.value).join(' ');
  return input.value.split('\n').slice(0, limit.value).join('\n');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="5" :placeholder="t('tools.textTruncate.inputPlaceholder')"  :input-props="{ id: 'textTruncateField0' }"/>
      <NSpace>
        <NSelect v-model:value="mode" :options="modeOptions" style="width:140px" />
        <NInputNumber v-model:value="limit" :min="1" style="width:120px"  :input-props="{ id: 'textTruncateField1' }"/>
      </NSpace>
      <NInput :value="output" type="textarea" :rows="5" readonly  :input-props="{ id: 'textTruncateField2' }"/>
    </NSpace></NCard>
  </ToolLayout>
</template>
