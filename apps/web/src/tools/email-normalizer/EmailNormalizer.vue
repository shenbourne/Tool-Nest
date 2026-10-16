<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NDataTable } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { normalizeEmails } from './email-normalizer.service';

const { t } = useI18n();
const tool = useCurrentTool();

const input = ref('John.Doe+newsletter@gmail.com\nJane.Smith@outlook.com');

const results = computed(() => normalizeEmails(input.value));

const normalizedOutput = computed(() =>
  results.value.map(r => r.error ? r.original : r.normalized).join('\n'),
);


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
    <ToolTextPanel v-model:input-text="input" :output-text="normalizedOutput" :input-title="t('tools.emailNormalizer.inputTitle')" :output-title="t('tools.emailNormalizer.outputTitle')" export-name="emails.txt">
      <template #input>
        <NInput
        v-model:value="input"
        type="textarea"
        :placeholder="t('tools.emailNormalizer.inputPlaceholder')"
        :autosize="{ minRows: 3, maxRows: 10 }"
        :input-props="{ id: 'emailNormalizerField0' }"/>
      </template>
      <template #output>
        <NInput
        :value="normalizedOutput"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 10 }"
        readonly
        :input-props="{ id: 'emailNormalizerField1' }"/>
      </template>
      <template #params>
        <NCard :title="t('common.results')">
        <NDataTable
        v-if="results.length > 0"
        :columns="columns"
        :data="tableData"
        :bordered="false"
        size="small"
        />
        </NCard>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
