<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NUpload, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const file = ref<File | null>(null);
const resultUrl = ref('');
const origSize = ref(0);
const newSize = ref(0);
const processing = ref(false);
function onFile(f: File | null) { file.value = f; resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'compressed.pdf'; a.click(); } }
async function process() {
  if (!file.value) return;
  processing.value = true;
  origSize.value = file.value.size;
  const { PDFDocument } = await import('pdf-lib');
  const buf = await file.value.arrayBuffer();
  const doc = await PDFDocument.load(buf);
  const bytes = await doc.save({ useObjectStreams: true });
  newSize.value = bytes.length;
  resultUrl.value = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  processing.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :max="1" accept=".pdf" @update:file-list="onFile($event[0]?.file)" />
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">{{ t('tools.compressPdf.compress') }}</NButton>
      <NAlert v-if="origSize" type="info" :title="t('tools.compressPdf.sizeResult', { orig: (origSize/1024).toFixed(1), next: (newSize/1024).toFixed(1) })" />
      <NButton v-if="resultUrl" @click="download">{{ t('tool.download') }}</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
