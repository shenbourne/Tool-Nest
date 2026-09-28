<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { parseDockerRun } from './docker-run-to-compose.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const input = ref('docker run -d -p 80:80 -v /my/data:/data --name my-app --restart always nginx');

const result = computed(() => parseDockerRun(input.value));

function copyOutput() {
  if (result.value.yaml) {
    copyToClipboard(result.value.yaml);
  }
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.dockerRunToCompose.inputTitle')">
        <NInput
          v-model:value="input"
          type="textarea"
          :placeholder="t('tools.dockerRunToCompose.inputPlaceholder')"
          :autosize="{ minRows: 3, maxRows: 10 }"
          monospace
         :input-props="{ id: 'dockerRunToComposeField0' }"/>
      </NCard>

      <NCard :title="t('tools.dockerRunToCompose.outputTitle')">
        <NAlert v-if="result.error" type="error" style="margin-bottom: 12px;">
          {{ result.error }}
        </NAlert>
        <NInput
          v-else
          :value="result.yaml"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 20 }"
          readonly
          monospace
         :input-props="{ id: 'dockerRunToComposeField1' }"/>
        <NButton :disabled="!result.yaml" @click="copyOutput" style="margin-top: 8px;">
          {{ t('tool.copy') }}
        </NButton>
      </NCard>

      <NAlert v-if="result.warnings.length > 0" type="warning">
        <template #header>{{ t('tools.dockerRunToCompose.warnings') }}</template>
        <ul style="margin: 0; padding-left: 16px;">
          <li v-for="(warning, idx) in result.warnings" :key="idx">{{ warning }}</li>
        </ul>
      </NAlert>
    </NSpace>
  </ToolLayout>
</template>
