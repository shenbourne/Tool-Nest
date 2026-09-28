<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInputNumber, NSelect, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { tool } from './index';

const { t } = useI18n();
const file = ref<File | null>(null);
const angle = ref(90);
const resultUrl = ref('');
const processing = ref(false);
const error = ref('');
function onFile(files: File[]) { const f = files[0] ?? null; file.value = f; resultUrl.value = ''; error.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'rotated.pdf'; a.click(); } }
async function process() {
  if (!file.value) return;
  processing.value = true;
  error.value = '';
  try {
    const { PDFDocument, degrees } = await import('pdf-lib');
    const buf = await file.value.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    // Accumulate on the page's existing rotation (e.g. scanned documents),
    // otherwise rotating a 90° scan by 90° is a no-op the user cannot see.
    doc.getPages().forEach(p => p.setRotation(degrees((p.getRotation().angle + angle.value) % 360)));
    const bytes = await doc.save();
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
      <ToolFileUpload accept=".pdf" @change="onFile" />
      <NSelect v-model:value="angle" :options="[{label:'90°',value:90},{label:'180°',value:180},{label:'270°',value:270}]" style="width:120px" />
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">{{ t('tools.pdfRotate.rotate') }}</NButton>
      <NAlert v-if="error" type="error" :title="error" />
      <NButton v-if="resultUrl" @click="download">{{ t('tool.download') }}</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
