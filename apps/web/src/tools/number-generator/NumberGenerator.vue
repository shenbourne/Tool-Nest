<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
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
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="numbers.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'numberGeneratorField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'numberGeneratorField1' }"/>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
