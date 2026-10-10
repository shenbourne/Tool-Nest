<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const pos = ref(1);
const output = computed(() => {
  const lines = input.value.split('\n');
  const n = ((pos.value % lines.length) + lines.length) % lines.length;
  return [...lines.slice(n), ...lines.slice(0, n)].join('\n');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.listItemsPlaceholder')"  :input-props="{ id: 'listRotateField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly  :input-props="{ id: 'listRotateField2' }"/>
      </template>
      <template #params>
        <NInputNumber v-model:value="pos" :placeholder="t('common.positions')" style="width:130px"  :input-props="{ id: 'listRotateField1' }"/>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
