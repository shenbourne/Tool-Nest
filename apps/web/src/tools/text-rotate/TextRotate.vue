<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('abcdefg');
const positions = ref(1);
const output = computed(() => {
  const chars = Array.from(input.value);
  if (!chars.length) return '';
  const n = ((positions.value % chars.length) + chars.length) % chars.length;
  return [...chars.slice(n), ...chars.slice(0, n)].join('');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('tools.textRotate.inputPlaceholder')"  :input-props="{ id: 'textRotateField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly  :input-props="{ id: 'textRotateField2' }"/>
      </template>
      <template #params>        <div class="tool-numeric-param">
          <label for="textRotateField1">{{ t('numericParams.rotatePositions') }}:</label>
          <NInputNumber v-model:value="positions" :placeholder="t('common.positions')" style="width:150px"  :input-props="{ id: 'textRotateField1' }"/>
        </div>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
