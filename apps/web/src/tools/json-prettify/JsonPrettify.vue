<script setup lang="ts">
import { NInput, NSelect, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { ref, computed } from 'vue';
import { formatJson } from './json-prettify.service';

const { t } = useI18n();
const tool = useCurrentTool();

const input = ref('');
const indent = ref<number | 'tab'>(2);

const indentOptions = computed(() => [
  ...Array.from({ length: 8 }, (_, i) => ({ label: t('tools.jsonPrettify.spaces', { count: i + 1 }), value: i + 1 })),
  { label: t('tools.jsonPrettify.tab'), value: 'tab' },
]);

const result = computed(() => formatJson(input.value, indent.value));
const output = computed(() => result.value.formatted);
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
          <NSelect v-model:value="indent" :options="indentOptions" :aria-label="t('common.indent')" style="width: 140px;" />
          <NButton @click="input = ''">{{ t('tool.clear') }}</NButton>
        </NSpace>
        <NAlert v-if="result.error" type="error" :title="result.error" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
