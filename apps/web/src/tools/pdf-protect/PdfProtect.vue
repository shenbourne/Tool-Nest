<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NUpload, NInput, NAlert } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const file = ref<File | null>(null);
const resultUrl = ref('');
const processing = ref(false);
function onFile(f: File | null) { file.value = f; resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'protected.pdf'; a.click(); } }
async function process() {
  if (!file.value) return;
  processing.value = true;
  const { PDFDocument } = await import('pdf-lib');
  const buf = await file.value.arrayBuffer();
  const doc = await PDFDocument.load(buf);
  doc.setTitle('Protected Document');
  const bytes = await doc.save();
  resultUrl.value = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  processing.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :max="1" accept=".pdf" @update:file-list="onFile($event[0]?.file)" />
      <NAlert type="warning" title="Note: Basic PDF re-save. Full encryption requires server-side processing." />
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">Process PDF</NButton>
      <NButton v-if="resultUrl" @click="download">Download</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
