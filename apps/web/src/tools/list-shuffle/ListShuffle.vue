<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
import ListSeparators from '@/components/ListSeparators.vue';
import { useListSeparators } from '@/composables/useListSeparators';

const { t } = useI18n();

const input = ref('');
const { inputSeparator, outputSeparator, items, formatOutput } = useListSeparators(input);
const shuffledItems = computed(() => {
  const arr = [...items.value];
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]] = [arr[j],arr[i]]; }
  return arr;
});
const output = computed(() => formatOutput(shuffledItems.value));
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'listShuffleField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'listShuffleField1' }"/>
      </template>
      <template #params>
        <ListSeparators v-model:input-separator="inputSeparator" v-model:output-separator="outputSeparator" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
