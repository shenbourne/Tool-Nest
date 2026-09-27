<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { jsonToYaml } from './json-to-yaml.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();
const input = ref('');

const output = computed(() => jsonToYaml(input.value).result);
const errorMsg = computed(() => jsonToYaml(input.value).error);

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
      <NCard :title="t('tools.jsonToYaml.input')">
        <NSpace vertical :size="12">
          <NInput
            v-model:value="input"
            type="textarea"
            :rows="10"
            placeholder='{ "name": "example" }'
          />
        </NSpace>
      </NCard>
      <NCard :title="t('tools.jsonToYaml.output')">
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
