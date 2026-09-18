<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert, NSelect, NSwitch } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
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

function copyOutput() {
  navigator.clipboard.writeText(output.value);
}
</script>
<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NAlert v-if="errorMsg" type="error" :title="t('common.error')">
        {{ errorMsg }}
      </NAlert>
      <NCard title="Input YAML">
        <NSpace vertical :size="12">
          <NInput
            v-model:value="input"
            type="textarea"
            :rows="10"
            placeholder="name: example&#10;version: 1.0"
          />
        </NSpace>
      </NCard>
      <NCard title="Options">
        <NSpace :size="16" align="center">
          <span>Indent size:</span>
          <NSelect
            v-model:value="indentSize"
            :options="indentOptions"
            style="width: 80px;"
          />
          <span>Sort keys:</span>
          <NSwitch v-model:value="sortKeys" />
        </NSpace>
      </NCard>
      <NCard title="Output YAML">
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
