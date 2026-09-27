<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert, NButton, NDivider } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { convertDockerComposeTo1panel } from './docker-compose-to-1panel.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const input = ref(`services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    restart: always
    networks:
      - frontend

  api:
    image: node:18
    ports:
      - "3000:3000"
    depends_on:
      - db
    networks:
      - frontend
      - backend

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: example
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - backend

networks:
  frontend:
  backend:

volumes:
  pgdata:
`);

const result = computed(() => convertDockerComposeTo1panel(input.value));

function copyOutput() {
  if (result.value.success) {
    copyToClipboard(result.value.output);
  }
}

const sampleInput = `services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
`;
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.dockerComposeTo1panel.inputTitle')">
        <NInput
          v-model:value="input"
          type="textarea"
          :placeholder="t('tools.dockerComposeTo1panel.inputPlaceholder')"
          :autosize="{ minRows: 10, maxRows: 30 }"
          style="font-family: monospace;"
        />
      </NCard>

      <NAlert v-if="!result.success && result.error" type="error">
        {{ result.error }}
      </NAlert>

      <NCard v-if="result.success" :title="t('tools.dockerComposeTo1panel.outputTitle')">
        <template #header-extra>
          <NButton size="small" @click="copyOutput">{{ t('tool.copy') }}</NButton>
        </template>
        <NInput
          :value="result.output"
          type="textarea"
          readonly
          :autosize="{ minRows: 10, maxRows: 30 }"
          style="font-family: monospace;"
        />
      </NCard>

      <NDivider />

      <NCard :title="t('common.about')">
        <div style="opacity: 0.8; line-height: 1.6;">
          {{ t('tools.dockerComposeTo1panel.aboutIntro') }}
          <ul style="margin-top: 8px;">
            <i18n-t keypath="tools.dockerComposeTo1panel.addsVersionField" tag="li">
              <template #field><code>version</code></template>
            </i18n-t>
            <i18n-t keypath="tools.dockerComposeTo1panel.addsAppNameLabels" tag="li">
              <template #field><code>com.1panel.appName</code></template>
            </i18n-t>
            <i18n-t keypath="tools.dockerComposeTo1panel.setsRestartPolicy" tag="li">
              <template #field><code>restart: always</code></template>
            </i18n-t>
            <li>{{ t('tools.dockerComposeTo1panel.convertsNetworks') }}</li>
            <li>{{ t('tools.dockerComposeTo1panel.addsNetworkNames') }}</li>
          </ul>
        </div>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
