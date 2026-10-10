<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { parseDockerRun } from './docker-run-to-compose.service';

const { t } = useI18n();
const tool = useCurrentTool();

const input = ref('docker run -d -p 80:80 -v /my/data:/data --name my-app --restart always nginx');

const result = computed(() => parseDockerRun(input.value));
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="result.yaml" :input-title="t('tools.dockerRunToCompose.inputTitle')" :output-title="t('tools.dockerRunToCompose.outputTitle')" export-name="docker-compose.yml">
      <template #input>
        <NInput
          v-model:value="input"
          type="textarea"
          :placeholder="t('tools.dockerRunToCompose.inputPlaceholder')"
          :autosize="{ minRows: 3, maxRows: 10 }"
          monospace
         :input-props="{ id: 'dockerRunToComposeField0' }"/>
      </template>
      <template #output>
        <NInput
          :value="result.yaml"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 20 }"
          readonly
          monospace
         :input-props="{ id: 'dockerRunToComposeField1' }"/>
      </template>
      <template #params>
        <NAlert v-if="result.error" type="error" style="margin-bottom: 12px;">
          {{ result.error }}
        </NAlert>
        <NAlert v-if="result.warnings.length > 0" type="warning">
          <template #header>{{ t('tools.dockerRunToCompose.warnings') }}</template>
          <ul style="margin: 0; padding-left: 16px;">
            <li v-for="(warning, idx) in result.warnings" :key="idx">{{ warning }}</li>
          </ul>
        </NAlert>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
