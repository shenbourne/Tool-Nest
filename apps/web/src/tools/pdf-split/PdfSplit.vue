<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NUpload, NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const file = ref<File | null>(null);
const pages = ref('1');
const resultUrl = ref('');
const processing = ref(false);
const error = ref('');
function onFile(f: File | null) { file.value = f; resultUrl.value = ''; error.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'split.pdf'; a.click(); } }
async function process() {
  if (!file.value) return;
  processing.value = true;
  error.value = '';
  try {
    const { PDFDocument } = await import('pdf-lib');
    const buf = await file.value.arrayBuffer();
    const src = await PDFDocument.load(buf);
    const out = await PDFDocument.create();
    const pageCount = src.getPageCount();
    const tokens = pages.value.split(/[,\s]+/).filter(Boolean);
    const invalid = tokens.filter((s) => !/^\d+$/.test(s) || Number(s) < 1 || Number(s) > pageCount);
    if (invalid.length) {
      error.value = t('tools.pdfSplit.invalidPages', { pages: invalid.join(', ') });
      processing.value = false;
      return;
    }
    const indices = tokens.map(s => Number(s) - 1);
    if (indices.length === 0) { error.value = t('tools.pdfSplit.noValidPages'); processing.value = false; return; }
    const copied = await out.copyPages(src, indices);
    copied.forEach(p => out.addPage(p));
    const bytes = await out.save();
    resultUrl.value = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('common.processingFailed');
  } finally {
    processing.value = false;
  }
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :max="1" accept=".pdf" @update:file-list="onFile($event[0]?.file)" />
      <NInput v-model:value="pages" :placeholder="t('tools.pdfSplit.pagesPlaceholder')" style="width:250px" />
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">{{ t('tools.pdfSplit.extractPages') }}</NButton>
      <NAlert v-if="error" type="error" :title="error" />
      <NButton v-if="resultUrl" @click="download">{{ t('tool.download') }}</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
