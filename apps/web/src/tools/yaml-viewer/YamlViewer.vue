<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSpace, NAlert, NSelect, NSwitch } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { formatYaml } from './yaml-viewer.service';

const { t } = useI18n();
const tool = useCurrentTool();
const input = ref('');
const sortKeys = ref(false);
const indentSize = ref(2);

const indentOptions = [
  { label: '2', value: 2 },
  { label: '4', value: 4 },
  { label: '6', value: 6 },
  { label: '8', value: 8 },
];

const output = computed(() =>
  formatYaml(input.value, { sortKeys: sortKeys.value, indentSize: indentSize.value }).result
);
const errorMsg = computed(() =>
  formatYaml(input.value, { sortKeys: sortKeys.value, indentSize: indentSize.value }).error
);
</script>
<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('tools.yamlViewer.inputTitle')" :output-title="t('tools.yamlViewer.outputTitle')" export-name="output.yaml">
      <template #input>
        <NInput
          v-model:value="input"
          type="textarea"
          :rows="10"
          placeholder="name: example&#10;version: 1.0"
         :input-props="{ id: 'yamlViewerField0' }"/>
      </template>
      <template #output>
        <NInput
          :value="output"
          type="textarea"
          :rows="10"
          readonly
          placeholder="name: example"
         :input-props="{ id: 'yamlViewerField1' }"/>
      </template>
      <template #params>
        <NSpace :size="16" align="center">
          <span>{{ t('tools.yamlViewer.indentSize') }}:</span>
          <NSelect
            v-model:value="indentSize"
            :options="indentOptions"
            style="width: 80px;"
          />
          <span>{{ t('tools.yamlViewer.sortKeys') }}:</span>
          <NSwitch v-model:value="sortKeys" />
        </NSpace>
        <NAlert v-if="errorMsg" type="error" :title="t('common.error')">
          {{ errorMsg }}
        </NAlert>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
