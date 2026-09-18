<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert, NDataTable } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { normalizeEmails } from './email-normalizer.service';

const { t } = useI18n();
const tool = useCurrentTool();

const input = ref('John.Doe+newsletter@gmail.com\nJane.Smith@outlook.com');

const results = computed(() => normalizeEmails(input.value));

const normalizedOutput = computed(() =>
  results.value.map(r => r.error ? r.original : r.normalized).join('\n'),
);

function copyOutput() {
  if (normalizedOutput.value) {
    navigator.clipboard.writeText(normalizedOutput.value);
  }
}

const columns = [
  { title: 'Original', key: 'original' },
  { title: 'Normalized', key: 'normalized' },
  { title: 'Status', key: 'status', width: 100 },
];

const tableData = computed(() =>
  results.value.map(r => ({
    original: r.original,
    normalized: r.normalized || r.error || '',
    status: r.error ? 'Error' : 'OK',
  })),
);
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Input Email Addresses">
        <NInput
          v-model:value="input"
          type="textarea"
          placeholder="Enter email addresses (one per line)..."
          :autosize="{ minRows: 3, maxRows: 10 }"
        />
      </NCard>

      <NCard title="Results">
        <NDataTable
          v-if="results.length > 0"
          :columns="columns"
          :data="tableData"
          :bordered="false"
          size="small"
        />
      </NCard>

      <NCard title="Normalized Output">
        <NInput
          :value="normalizedOutput"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 10 }"
          readonly
        />
        <NButton :disabled="!normalizedOutput" @click="copyOutput" style="margin-top: 8px;">
          {{ t('tool.copy') }}
        </NButton>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
