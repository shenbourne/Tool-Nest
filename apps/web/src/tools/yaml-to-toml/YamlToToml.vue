<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { yamlToToml } from './yaml-to-toml.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();
const input = ref('');

const output = computed(() => yamlToToml(input.value).result);
const errorMsg = computed(() => yamlToToml(input.value).error);

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
      <NCard :title="t('tools.yamlToToml.input')">
        <NSpace vertical :size="12">
          <NInput
            v-model:value="input"
            type="textarea"
            :rows="10"
            placeholder="name: example&#10;version: 1.0"
          />
        </NSpace>
      </NCard>
      <NCard :title="t('tools.yamlToToml.output')">
        <NSpace vertical :size="12">
          <NInput
            :value="output"
            type="textarea"
            :rows="10"
            readonly
            placeholder='name = "example"'
          />
          <NButton :disabled="!output" @click="copyOutput">
            {{ t('tool.copy') }}
          </NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
