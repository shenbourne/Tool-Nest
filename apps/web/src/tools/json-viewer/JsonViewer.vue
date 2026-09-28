<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { formatJson } from './json-viewer.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const input = ref('{\n  "name": "ToolNest",\n  "version": 1\n}');
const indentSize = ref(2);

const result = computed(() => formatJson(input.value, indentSize.value));

function copyOutput() {
  if (result.value.formatted) {
    copyToClipboard(result.value.formatted);
  }
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('common.inputJson')">
        <NInput
          v-model:value="input"
          type="textarea"
          :placeholder="t('tools.jsonViewer.inputPlaceholder')"
          :autosize="{ minRows: 6, maxRows: 20 }"
          monospace
         :input-props="{ id: 'jsonViewerField0' }"/>
        <NSpace align="center" :size="12" style="margin-top: 8px;">
          <span>{{ t('common.indent') }}:</span>
          <NInputNumber v-model:value="indentSize" :min="1" :max="8" :show-button="false" style="width: 80px"  :input-props="{ id: 'jsonViewerField1' }"/>
        </NSpace>
      </NCard>

      <NCard :title="t('tools.jsonViewer.outputTitle')">
        <NAlert v-if="result.error" type="error" style="margin-bottom: 12px;">
          {{ result.error }}
        </NAlert>
        <NInput
          v-else
          :value="result.formatted"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 20 }"
          readonly
          monospace
         :input-props="{ id: 'jsonViewerField2' }"/>
        <NButton :disabled="!result.formatted" @click="copyOutput" style="margin-top: 8px;">
          {{ t('tool.copy') }}
        </NButton>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
