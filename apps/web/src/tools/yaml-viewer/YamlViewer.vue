<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert, NSelect, NSwitch } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { formatYaml } from './yaml-viewer.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
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

function copyOutput() {
  copyToClipboard(output.value);
}
</script>
<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NAlert v-if="errorMsg" type="error" :title="t('common.error')">
        {{ errorMsg }}
      </NAlert>
      <NCard :title="t('tools.yamlViewer.inputTitle')">
        <NSpace vertical :size="12">
          <NInput
            v-model:value="input"
            type="textarea"
            :rows="10"
            placeholder="name: example&#10;version: 1.0"
          />
        </NSpace>
      </NCard>
      <NCard :title="t('common.options')">
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
      </NCard>
      <NCard :title="t('tools.yamlViewer.outputTitle')">
        <NSpace vertical :size="12">
          <NInput
            :value="output"
            type="textarea"
            :rows="10"
            readonly
            placeholder="name: example"
          />
          <NButton :disabled="!output" @click="copyOutput">
            {{ t('tool.copy') }}
          </NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
