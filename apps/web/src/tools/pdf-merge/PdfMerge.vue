<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';

const { t } = useI18n();
const { copyFileToClipboard } = useCopy();
const files = ref<File[]>([]);
const resultUrl = ref('');
const processing = ref(false);
const error = ref('');
function onFiles(list: File[]) { if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); resultUrl.value = ''; files.value = list; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'merged.pdf'; a.click(); } }
async function copy() {
  if (!resultUrl.value) return;
  const res = await fetch(resultUrl.value);
  const blob = await res.blob();
  await copyFileToClipboard(blob);
}
async function process() {
  if (files.value.length < 2) { error.value = t('tools.pdfMerge.selectAtLeastTwo'); return; }
  processing.value = true; error.value = '';
  try {
    const { PDFDocument } = await import('pdf-lib');
    const merged = await PDFDocument.create();
    for (const f of files.value) {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    const bytes = await merged.save();
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
    resultUrl.value = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  } catch (e: any) { error.value = e.message; }
  processing.value = false;
}
onUnmounted(() => {
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <ToolFileUpload accept=".pdf" multiple @change="onFiles" />
      <NAlert v-if="files.length" type="info" :title="t('tools.pdfMerge.filesSelected', { count: files.length })" />
      <NButton type="primary" :loading="processing" @click="process" :disabled="files.length < 2">{{ t('tools.pdfMerge.merge') }}</NButton>
      <NAlert v-if="error" type="error" :title="error" />
      <NButton v-if="resultUrl" @click="download">{{ t('tools.pdfMerge.downloadMerged') }}</NButton>
      <NButton v-if="resultUrl" @click="copy">{{ t('tool.copyFile') }}</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
