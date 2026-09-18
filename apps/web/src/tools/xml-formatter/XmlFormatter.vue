<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NRadioGroup, NRadioButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { formatXml, minifyXml } from './xml-formatter.service';

const { t } = useI18n();
const tool = useCurrentTool();

const input = ref('<root>\n<child name="test">\n<sub>Hello</sub>\n</child>\n</root>');
const indentSize = ref(2);
const mode = ref<'format' | 'minify'>('format');

const result = computed(() => {
  if (mode.value === 'minify') {
    return minifyXml(input.value);
  }
  return formatXml(input.value, indentSize.value);
});

function copyOutput() {
  if (result.value.formatted) {
    navigator.clipboard.writeText(result.value.formatted);
  }
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Input XML">
        <NInput
          v-model:value="input"
          type="textarea"
          placeholder="Paste your XML here..."
          :autosize="{ minRows: 6, maxRows: 20 }"
          monospace
        />
        <NSpace align="center" :size="12" style="margin-top: 8px;">
          <NRadioGroup v-model:value="mode">
            <NRadioButton value="format">Format</NRadioButton>
            <NRadioButton value="minify">Minify</NRadioButton>
          </NRadioGroup>
          <template v-if="mode === 'format'">
            <span>Indent:</span>
            <NRadioGroup v-model:value="indentSize" size="small">
              <NRadioButton :value="2">2 spaces</NRadioButton>
              <NRadioButton :value="4">4 spaces</NRadioButton>
            </NRadioGroup>
          </template>
        </NSpace>
      </NCard>

      <NCard title="Output">
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
