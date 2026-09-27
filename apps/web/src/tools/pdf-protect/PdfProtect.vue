<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NUpload, NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const file = ref<File | null>(null);
const resultUrl = ref('');
const processing = ref(false);
function onFile(f: File | null) { file.value = f; if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'protected.pdf'; a.click(); } }
async function process() {
  if (!file.value) return;
  processing.value = true;
  const { PDFDocument } = await import('pdf-lib');
  const buf = await file.value.arrayBuffer();
  const doc = await PDFDocument.load(buf);
  doc.setTitle('Protected Document');
  const bytes = await doc.save();
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
  resultUrl.value = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  processing.value = false;
}
onUnmounted(() => {
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :max="1" accept=".pdf" @update:file-list="onFile($event[0]?.file)" />
      <NAlert type="warning" :title="t('tools.pdfProtect.note')" />
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">{{ t('tools.pdfProtect.process') }}</NButton>
      <NButton v-if="resultUrl" @click="download">{{ t('tool.download') }}</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
