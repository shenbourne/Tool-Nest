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
const file = ref<File | null>(null);
const processing = ref(false);
const error = ref('');
const extractedText = ref('');
const resultUrl = ref('');

function onFile(files: File[]) {
  const f = files[0] ?? null;
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

async function copy() {
  if (!resultUrl.value) return;
  const res = await fetch(resultUrl.value);
  const blob = await res.blob();
  await copyFileToClipboard(blob);
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
    error.value = e.message || t('tools.pdfToEpub.failed');
  }
  processing.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <ToolFileUpload accept=".pdf" @change="onFile" />
      <NButton type="primary" :loading="processing" @click="convert" :disabled="!file">
        {{ t('common.convert') }}
      </NButton>
      <NAlert v-if="error" type="error" :title="error" />
      <NCard v-if="extractedText" :title="t('tools.pdfToEpub.previewTitle')" size="small">
        <pre style="max-height: 400px; overflow: auto; white-space: pre-wrap; font-size: 12px;">{{ extractedText }}</pre>
      </NCard>
      <NButton v-if="resultUrl" @click="download">{{ t('tools.pdfToEpub.downloadText') }}</NButton>
      <NButton v-if="resultUrl" @click="copy">{{ t('tool.copyFile') }}</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
