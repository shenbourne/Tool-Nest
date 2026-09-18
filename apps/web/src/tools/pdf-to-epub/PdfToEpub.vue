<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NUpload, NAlert } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const file = ref<File | null>(null);
const processing = ref(false);
const error = ref('');
const extractedText = ref('');
const resultUrl = ref('');

function onFile(f: File | null) {
  file.value = f;
  extractedText.value = '';
  resultUrl.value = '';
  error.value = '';
}

function download() {
  if (resultUrl.value) {
    const a = document.createElement('a');
    a.href = resultUrl.value;
    a.download = 'extracted.txt';
    a.click();
  }
}

async function convert() {
  if (!file.value) return;
  processing.value = true;
  error.value = '';
  extractedText.value = '';
  resultUrl.value = '';
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
    const buf = await file.value.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => ('str' in item) ? item.str : '')
        .join(' ');
      textParts.push(`--- Page ${i} ---\n${pageText}`);
    }

    extractedText.value = textParts.join('\n\n');
    const blob = new Blob([extractedText.value], { type: 'text/plain' });
    resultUrl.value = URL.createObjectURL(blob);
  } catch (e: any) {
    error.value = e.message || 'Failed to extract text';
  }
  processing.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :max="1" accept=".pdf" @update:file-list="onFile($event[0]?.file)" />
      <NButton type="primary" :loading="processing" @click="convert" :disabled="!file">
        Convert
      </NButton>
      <NAlert v-if="error" type="error" :title="error" />
      <NCard v-if="extractedText" title="Extracted Text Preview" size="small">
        <pre style="max-height: 400px; overflow: auto; white-space: pre-wrap; font-size: 12px;">{{ extractedText }}</pre>
      </NCard>
      <NButton v-if="resultUrl" @click="download">Download Text File</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
