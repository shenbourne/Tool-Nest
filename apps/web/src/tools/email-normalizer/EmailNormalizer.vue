<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert, NDataTable } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { normalizeEmails } from './email-normalizer.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const input = ref('John.Doe+newsletter@gmail.com\nJane.Smith@outlook.com');

const results = computed(() => normalizeEmails(input.value));

const normalizedOutput = computed(() =>
  results.value.map(r => r.error ? r.original : r.normalized).join('\n'),
);

function copyOutput() {
  if (normalizedOutput.value) {
    copyToClipboard(normalizedOutput.value);
  }
}

const columns = computed(() => [
  { title: t('tools.emailNormalizer.original'), key: 'original' },
  { title: t('tools.emailNormalizer.normalized'), key: 'normalized' },
  { title: t('tools.emailNormalizer.status'), key: 'status', width: 100 },
]);

const tableData = computed(() =>
  results.value.map(r => ({
    original: r.original,
    normalized: r.normalized || r.error || '',
    status: r.error ? t('common.error') : t('tools.emailNormalizer.ok'),
  })),
);
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.emailNormalizer.inputTitle')">
        <NInput
          v-model:value="input"
          type="textarea"
          :placeholder="t('tools.emailNormalizer.inputPlaceholder')"
          :autosize="{ minRows: 3, maxRows: 10 }"
        />
      </NCard>

      <NCard :title="t('common.results')">
        <NDataTable
          v-if="results.length > 0"
          :columns="columns"
          :data="tableData"
          :bordered="false"
          size="small"
        />
      </NCard>

      <NCard :title="t('tools.emailNormalizer.outputTitle')">
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
