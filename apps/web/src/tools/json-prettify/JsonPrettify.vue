<script setup lang="ts">
import { NInput, NSelect, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { ref, computed, watch } from 'vue';

const { t } = useI18n();
const tool = useCurrentTool();

const input = ref('');
const indent = ref(2);
const error = ref('');

const indentOptions = [
  { label: '2 spaces', value: 2 },
  { label: '4 spaces', value: 4 },
  { label: 'Tab', value: 0 },
];

const output = computed(() => {
  if (!input.value.trim()) return '';
  try {
    const parsed = JSON.parse(input.value);
    if (indent.value === 0) return JSON.stringify(parsed, null, '\t');
    return JSON.stringify(parsed, null, indent.value);
  } catch (e: any) {
    error.value = e.message;
    return '';
  }
});

watch(input, () => { error.value = ''; });
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('tools.jsonPrettify.input')" :output-title="t('tools.jsonPrettify.output')" export-name="output.json">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="8" placeholder='{"key":"value"}'  :input-props="{ id: 'jsonPrettifyField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="8" readonly  :input-props="{ id: 'jsonPrettifyField1' }"/>
      </template>
      <template #params>
        <NSpace align="center">
          <NSelect v-model:value="indent" :options="indentOptions" style="width: 140px;" />
          <NButton @click="input = ''">{{ t('tool.clear') }}</NButton>
        </NSpace>
        <NAlert v-if="error" type="error" :title="error" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
