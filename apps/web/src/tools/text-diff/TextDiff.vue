<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSpace, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import DiffViewer from '@/components/DiffViewer.vue';
import ToolTextPairPanel from '@/components/ToolTextPairPanel.vue';
import { diffLines, summarize } from '@/utils/line-diff';
import { tool } from './index';
const { t } = useI18n();
const text1 = ref('');
const text2 = ref('');
const rows = computed(() => diffLines(text1.value, text2.value));
const stats = computed(() => summarize(rows.value));
</script>
<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <ToolTextPairPanel
        v-model:left-text="text1"
        v-model:right-text="text2"
        :left-title="t('tools.textDiff.original')"
        :right-title="t('tools.textDiff.modified')"
      >
        <template #left><NInput v-model:value="text1" type="textarea" :rows="8" :input-props="{ id: 'textDiffField0' }" /></template>
        <template #right><NInput v-model:value="text2" type="textarea" :rows="8" :input-props="{ id: 'textDiffField1' }" /></template>
      </ToolTextPairPanel>
      <NSpace><NTag type="success">{{ t('tools.textDiff.same', { count: stats.same }) }}</NTag><NTag type="warning">{{ t('tools.textDiff.changed', { count: stats.changed }) }}</NTag><NTag type="error">{{ t('tools.textDiff.removed', { count: stats.removed }) }}</NTag><NTag type="info">{{ t('tools.textDiff.added', { count: stats.added }) }}</NTag></NSpace>
      <DiffViewer
        v-if="rows.length"
        :rows="rows"
        :left-title="t('tools.textDiff.original')"
        :right-title="t('tools.textDiff.modified')"
      />
    </NSpace>
  </ToolLayout>
</template>
