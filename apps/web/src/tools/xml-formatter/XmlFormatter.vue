<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NRadioGroup, NRadioButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { formatXml, minifyXml } from './xml-formatter.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
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
    copyToClipboard(result.value.formatted);
  }
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.xmlFormatter.inputTitle')">
        <NInput
          v-model:value="input"
          type="textarea"
          :placeholder="t('tools.xmlFormatter.inputPlaceholder')"
          :autosize="{ minRows: 6, maxRows: 20 }"
          monospace
         :input-props="{ id: 'xmlFormatterField0' }"/>
        <NSpace align="center" :size="12" style="margin-top: 8px;">
          <NRadioGroup v-model:value="mode">
            <NRadioButton value="format">{{ t('common.format') }}</NRadioButton>
            <NRadioButton value="minify">{{ t('tools.xmlFormatter.minify') }}</NRadioButton>
          </NRadioGroup>
          <template v-if="mode === 'format'">
            <span>{{ t('common.indent') }}:</span>
            <NRadioGroup v-model:value="indentSize" size="small">
              <NRadioButton :value="2">{{ t('tools.xmlFormatter.spaces', { n: 2 }) }}</NRadioButton>
              <NRadioButton :value="4">{{ t('tools.xmlFormatter.spaces', { n: 4 }) }}</NRadioButton>
            </NRadioGroup>
          </template>
        </NSpace>
      </NCard>

      <NCard :title="t('common.output')">
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
         :input-props="{ id: 'xmlFormatterField1' }"/>
        <NButton :disabled="!result.formatted" @click="copyOutput" style="margin-top: 8px;">
          {{ t('tool.copy') }}
        </NButton>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
