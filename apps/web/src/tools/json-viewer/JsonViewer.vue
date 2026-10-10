<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSpace, NAlert, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { formatJson } from './json-viewer.service';

const { t } = useI18n();
const tool = useCurrentTool();

const input = ref('{\n  "name": "ToolNest",\n  "version": 1\n}');
const indentSize = ref(2);

const result = computed(() => formatJson(input.value, indentSize.value));
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="result.formatted" :input-title="t('common.inputJson')" :output-title="t('tools.jsonViewer.outputTitle')" export-name="output.json">
      <template #input>
        <NInput
          v-model:value="input"
          type="textarea"
          :placeholder="t('tools.jsonViewer.inputPlaceholder')"
          :autosize="{ minRows: 6, maxRows: 20 }"
          monospace
         :input-props="{ id: 'jsonViewerField0' }"/>
      </template>
      <template #output>
        <NInput
          :value="result.formatted"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 20 }"
          readonly
          monospace
         :input-props="{ id: 'jsonViewerField2' }"/>
      </template>
      <template #params>
        <NSpace align="center" :size="12">
          <span>{{ t('common.indent') }}:</span>
          <NInputNumber v-model:value="indentSize" :min="1" :max="8" :show-button="false" style="width: 80px"  :input-props="{ id: 'jsonViewerField1' }"/>
        </NSpace>
        <NAlert v-if="result.error" type="error" style="margin-bottom: 12px;">
          {{ result.error }}
        </NAlert>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
