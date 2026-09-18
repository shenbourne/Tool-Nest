<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NSelect, NSwitch, NButton } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
import { convertList } from './list-converter.service';

const inputText = ref('apple, banana, apple, cherry, banana, date');

const separator = ref(',');
const separatorOptions = [
  { label: 'Comma (,)', value: ',' },
  { label: 'Semicolon (;)', value: ';' },
  { label: 'Newline', value: '\n' },
  { label: 'Tab', value: '\t' },
  { label: 'Pipe (|)', value: '|' },
  { label: 'Space', value: ' ' },
];

const trimItems = ref(true);
const removeEmpty = ref(true);
const lowerCase = ref(false);
const removeDuplicates = ref(false);
const sortItems = ref<'none' | 'asc' | 'desc'>('none');
const sortOptions = [
  { label: 'None', value: 'none' },
  { label: 'Ascending', value: 'asc' },
  { label: 'Descending', value: 'desc' },
];
const itemPrefix = ref('');
const itemSuffix = ref('');

const output = computed(() => {
  return convertList(inputText.value, {
    separator: separator.value,
    trimItems: trimItems.value,
    removeEmpty: removeEmpty.value,
    lowerCase: lowerCase.value,
    sortItems: sortItems.value,
    removeDuplicates: removeDuplicates.value,
    itemPrefix: itemPrefix.value,
    itemSuffix: itemSuffix.value,
  });
});

function copyOutput() {
  navigator.clipboard.writeText(output.value);
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Input">
        <NInput
          v-model:value="inputText"
          type="textarea"
          placeholder="Enter list items..."
          :autosize="{ minRows: 4, maxRows: 10 }"
        />
      </NCard>

      <NCard title="Options">
        <NSpace vertical :size="12">
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">Separator</span>
            <NSelect v-model:value="separator" :options="separatorOptions" style="width: 200px;" />
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">Sort Order</span>
            <NSelect v-model:value="sortItems" :options="sortOptions" style="width: 200px;" />
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">Trim Items</span>
            <NSwitch v-model:value="trimItems" />
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">Remove Empty</span>
            <NSwitch v-model:value="removeEmpty" />
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">Lowercase</span>
            <NSwitch v-model:value="lowerCase" />
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">Remove Duplicates</span>
            <NSwitch v-model:value="removeDuplicates" />
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">Item Prefix</span>
            <NInput v-model:value="itemPrefix" placeholder="Prefix" clearable style="width: 200px;" />
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">Item Suffix</span>
            <NInput v-model:value="itemSuffix" placeholder="Suffix" clearable style="width: 200px;" />
          </div>
        </NSpace>
      </NCard>

      <NCard title="Output">
        <NSpace vertical :size="8">
          <NInput
            :value="output"
            type="textarea"
            readonly
            :autosize="{ minRows: 4, maxRows: 10 }"
          />
          <NButton @click="copyOutput" size="small">Copy</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
