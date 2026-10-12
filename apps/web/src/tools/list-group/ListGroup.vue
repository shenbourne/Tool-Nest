<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
import ListSeparators from '@/components/ListSeparators.vue';
import { useListSeparators } from '@/composables/useListSeparators';

const { t } = useI18n();

const input = ref('');
const { inputSeparator, outputSeparator, items, formatOutput } = useListSeparators(input);
const size = ref(3);
const output = computed(() => {
  const values = items.value;
  // Clearing the input yields null, and `i += null` would loop forever, so
  // fall back to a positive step whenever the value is missing or invalid.
  const step = size.value && size.value >= 1 ? size.value : 3;
  const groups: string[] = [];
  for (let i = 0; i < values.length; i += step) groups.push(t('tools.listGroup.groupLabel', { number: groups.length + 1 }) + '\n' + formatOutput(values.slice(i, i+step)));
  return groups.join('\n');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('tools.listConverter.inputPlaceholder')"  :input-props="{ id: 'listGroupField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="8" readonly  :input-props="{ id: 'listGroupField2' }"/>
      </template>
      <template #params>
        <ListSeparators v-model:input-separator="inputSeparator" v-model:output-separator="outputSeparator" />
        <NInputNumber v-model:value="size" :min="1" :placeholder="t('tools.listGroup.groupSize')" style="width:130px"  :input-props="{ id: 'listGroupField1' }"/>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
