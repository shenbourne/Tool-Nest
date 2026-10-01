<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NAlert } from 'naive-ui';
import FileCard from '@/components/FileCard.vue';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const { copyFileToClipboard } = useCopy();
const file = ref<File | null>(null);
const processing = ref(false);
const error = ref('');
const extractedText = ref('');
const resultUrl = ref('');
const resultFile = ref<File | null>(null);

function onFile(files: File[]) {
  const f = files[0] ?? null;
  file.value = f;
  extractedText.value = '';
  resultUrl.value = '';
  resultFile.value = null;
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
  resultFile.value = null;
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
    resultFile.value = new File([extractedText.value], 'extracted.txt', { type: 'text/plain' });
  } catch (e: any) {
    error.value = e.message || t('tools.pdfToEpub.failed');
  }
  processing.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <ToolFileUpload ref="fileUpload" accept=".pdf" compact @change="onFile" />
        </template>
        <template #output-files>
          <FileCard v-if="resultFile" name="extracted.txt" :file="resultFile" file-type="text/plain" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultUrl" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!resultUrl" @click="download">{{ t('tool.exportFile') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NButton type="primary" :loading="processing" @click="convert" :disabled="!file" block>
              {{ t('common.convert') }}
            </NButton>
            <NAlert v-if="error" type="error" :title="error" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
