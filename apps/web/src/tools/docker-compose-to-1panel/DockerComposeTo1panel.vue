<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert, NButton, NDivider } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { convertDockerComposeTo1panel } from './docker-compose-to-1panel.service';

const { t } = useI18n();
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
    navigator.clipboard.writeText(result.value.output);
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
      <NCard title="Docker Compose YAML (Input)">
        <NInput
          v-model:value="input"
          type="textarea"
          placeholder="Paste docker-compose YAML here..."
          :autosize="{ minRows: 10, maxRows: 30 }"
          style="font-family: monospace;"
        />
      </NCard>

      <NAlert v-if="!result.success && result.error" type="error">
        {{ result.error }}
      </NAlert>

      <NCard v-if="result.success" title="1Panel Format (Output)">
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

      <NCard title="About">
        <div style="opacity: 0.8; line-height: 1.6;">
          Converts standard docker-compose YAML to 1Panel-compatible format by:
          <ul style="margin-top: 8px;">
            <li>Adding <code>version</code> field if missing (defaults to 3.8)</li>
            <li>Adding <code>com.1panel.appName</code> labels</li>
            <li>Setting <code>restart: always</code> if not specified</li>
            <li>Converting network arrays to map format</li>
            <li>Adding explicit network names and volume drivers</li>
          </ul>
        </div>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
