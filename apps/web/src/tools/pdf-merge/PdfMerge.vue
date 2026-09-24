<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NUpload, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const files = ref<File[]>([]);
const resultUrl = ref('');
const processing = ref(false);
const error = ref('');
function onFiles(list: any[]) { files.value = list.map(f => f.file).filter(Boolean); }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'merged.pdf'; a.click(); } }
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
    resultUrl.value = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  } catch (e: any) { error.value = e.message; }
  processing.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :multiple="true" accept=".pdf" @update:file-list="onFiles" />
      <NAlert v-if="files.length" type="info" :title="t('tools.pdfMerge.filesSelected', { count: files.length })" />
      <NButton type="primary" :loading="processing" @click="process" :disabled="files.length < 2">{{ t('tools.pdfMerge.merge') }}</NButton>
      <NAlert v-if="error" type="error" :title="error" />
      <NButton v-if="resultUrl" @click="download">{{ t('tools.pdfMerge.downloadMerged') }}</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
