<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { formatJson } from './json-viewer.service';

const { t } = useI18n();
const tool = useCurrentTool();

const input = ref('{\n  "name": "ToolNest",\n  "version": 1\n}');
const indentSize = ref(2);

const result = computed(() => formatJson(input.value, indentSize.value));

function copyOutput() {
  if (result.value.formatted) {
    navigator.clipboard.writeText(result.value.formatted);
  }
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Input JSON">
        <NInput
          v-model:value="input"
          type="textarea"
          placeholder="Paste your JSON here..."
          :autosize="{ minRows: 6, maxRows: 20 }"
          monospace
        />
        <NSpace align="center" :size="12" style="margin-top: 8px;">
          <span>Indent:</span>
          <NInputNumber v-model:value="indentSize" :min="1" :max="8" :show-button="false" style="width: 80px" />
        </NSpace>
      </NCard>

      <NCard title="Formatted Output">
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
        />
        <NButton :disabled="!result.formatted" @click="copyOutput" style="margin-top: 8px;">
          {{ t('tool.copy') }}
        </NButton>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
