<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NUpload, NAlert } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const file = ref<File | null>(null);
const resultUrl = ref('');
const processing = ref(false);
function onFile(f: File | null) { file.value = f; resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'output.pdf'; a.click(); } }
async function process() {
  if (!file.value) return;
  processing.value = true;
  const { jsPDF } = await import('jspdf');
  if (file.value.type.startsWith('image/')) {
    const img = new Image();
    img.onload = async () => {
      const pdf = new jsPDF({ orientation: img.width > img.height ? 'l' : 'p', unit: 'px', format: [img.width, img.height] });
      pdf.addImage(img, 'JPEG', 0, 0, img.width, img.height);
      resultUrl.value = URL.createObjectURL(new Blob([pdf.output('blob')], { type: 'application/pdf' }));
      processing.value = false;
    };
    img.src = URL.createObjectURL(file.value);
  } else { processing.value = false; }
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :max="1" accept="image/*" @update:file-list="onFile($event[0]?.file)" />
      <NAlert type="info" title="Converts images (JPG, PNG, WebP) to PDF" />
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">Convert to PDF</NButton>
      <NButton v-if="resultUrl" @click="download">Download PDF</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
