<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NUpload, NInputNumber, NSelect } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const file = ref<File | null>(null);
const angle = ref(90);
const resultUrl = ref('');
const processing = ref(false);
function onFile(f: File | null) { file.value = f; resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'rotated.pdf'; a.click(); } }
async function process() {
  if (!file.value) return;
  processing.value = true;
  const { PDFDocument, degrees } = await import('pdf-lib');
  const buf = await file.value.arrayBuffer();
  const doc = await PDFDocument.load(buf);
  doc.getPages().forEach(p => p.setRotation(degrees(angle.value)));
  const bytes = await doc.save();
  resultUrl.value = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  processing.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :max="1" accept=".pdf" @update:file-list="onFile($event[0]?.file)" />
      <NSelect v-model:value="angle" :options="[{label:'90°',value:90},{label:'180°',value:180},{label:'270°',value:270}]" style="width:120px" />
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">{{ t('tools.pdfRotate.rotate') }}</NButton>
      <NButton v-if="resultUrl" @click="download">{{ t('tool.download') }}</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
