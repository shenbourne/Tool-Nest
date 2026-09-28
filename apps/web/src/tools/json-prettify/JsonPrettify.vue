<script setup lang="ts">
import { NCard, NInput, NSelect, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { ref, computed, watch } from 'vue';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
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

function copyOutput() {
  if (output.value) copyToClipboard(output.value);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NSpace align="center">
        <NSelect v-model:value="indent" :options="indentOptions" style="width: 140px;" />
        <NButton @click="input = ''">{{ t('tool.clear') }}</NButton>
        <NButton type="primary" @click="copyOutput" :disabled="!output">{{ t('tool.copy') }}</NButton>
      </NSpace>
      <NAlert v-if="error" type="error" :title="error" />
      <NCard :title="t('tools.jsonPrettify.input')">
        <NInput v-model:value="input" type="textarea" :rows="8" placeholder='{"key":"value"}'  :input-props="{ id: 'jsonPrettifyField0' }"/>
      </NCard>
      <NCard :title="t('tools.jsonPrettify.output')">
        <NInput :value="output" type="textarea" :rows="8" readonly  :input-props="{ id: 'jsonPrettifyField1' }"/>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
