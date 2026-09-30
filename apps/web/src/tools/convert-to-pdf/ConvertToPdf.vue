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
const resultUrl = ref('');
const processing = ref(false);
function onFile(files: File[]) { const f = files[0] ?? null; if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); file.value = f; resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'output.pdf'; a.click(); } }
async function copy() {
  if (!resultUrl.value) return;
  const res = await fetch(resultUrl.value);
  const blob = await res.blob();
  await copyFileToClipboard(blob);
}
function imageFormat(type: string) { return type === 'image/png' ? 'PNG' : type === 'image/webp' ? 'WEBP' : 'JPEG'; }
async function process() {
  const f = file.value;
  if (!f) return;
  processing.value = true;
  const { jsPDF } = await import('jspdf');
  if (!f.type.startsWith('image/')) { processing.value = false; return; }
  const img = new Image();
  const objectUrl = URL.createObjectURL(f);
  img.onload = () => {
    try {
      if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
      const pdf = new jsPDF({ orientation: img.width > img.height ? 'l' : 'p', unit: 'px', format: [img.width, img.height] });
      pdf.addImage(img, imageFormat(f.type), 0, 0, img.width, img.height);
      resultUrl.value = URL.createObjectURL(pdf.output('blob'));
    } finally {
      URL.revokeObjectURL(objectUrl);
      processing.value = false;
    }
  };
  img.onerror = () => { URL.revokeObjectURL(objectUrl); processing.value = false; };
  img.src = objectUrl;
}
onUnmounted(() => { if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); });
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <ToolFileUpload accept="image/*" @change="onFile" />
      <NAlert type="info" :title="t('tools.convertToPdf.info')" />
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">{{ t('tools.convertToPdf.convert') }}</NButton>
      <NButton v-if="resultUrl" @click="download">{{ t('tools.convertToPdf.downloadPdf') }}</NButton>
      <NButton v-if="resultUrl" @click="copy">{{ t('tool.copyFile') }}</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
