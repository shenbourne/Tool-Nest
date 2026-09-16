<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NUpload, NInput } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const file = ref<File | null>(null);
const pages = ref('1');
const resultUrl = ref('');
const processing = ref(false);
function onFile(f: File | null) { file.value = f; resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'split.pdf'; a.click(); } }
async function process() {
  if (!file.value) return;
  processing.value = true;
  const { PDFDocument } = await import('pdf-lib');
  const buf = await file.value.arrayBuffer();
  const src = await PDFDocument.load(buf);
  const out = await PDFDocument.create();
  const indices = pages.value.split(/[,\s]+/).map(s => { const n = parseInt(s) - 1; return n >= 0 && n < src.getPageCount() ? n : -1; }).filter(n => n >= 0);
  const copied = await out.copyPages(src, indices);
  copied.forEach(p => out.addPage(p));
  const bytes = await out.save();
  resultUrl.value = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  processing.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :max="1" accept=".pdf" @update:file-list="onFile($event[0]?.file)" />
      <NInput v-model:value="pages" placeholder="Page numbers: 1 3 5" style="width:250px" />
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">Extract Pages</NButton>
      <NButton v-if="resultUrl" @click="download">Download</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
