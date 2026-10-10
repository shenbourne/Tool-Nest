<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSpace, NRadioGroup, NRadioButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
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
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="result.formatted" :input-title="t('tools.xmlFormatter.inputTitle')" :output-title="t('common.output')" export-name="output.xml">
      <template #input>
        <NInput
          v-model:value="input"
          type="textarea"
          :placeholder="t('tools.xmlFormatter.inputPlaceholder')"
          :autosize="{ minRows: 6, maxRows: 20 }"
          monospace
         :input-props="{ id: 'xmlFormatterField0' }"/>
      </template>
      <template #output>
        <NInput
          :value="result.formatted"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 20 }"
          readonly
          monospace
         :input-props="{ id: 'xmlFormatterField1' }"/>
      </template>
      <template #params>
        <NSpace align="center" :size="12">
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
        <NAlert v-if="result.error" type="error" style="margin-bottom: 12px;">
          {{ result.error }}
        </NAlert>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
