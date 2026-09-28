<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { NCard, NSpace, NButton, NUpload, NInput, NInputNumber, NSelect, NColorPicker, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const file = ref<File | null>(null);
const text = ref('');
const position = ref<string>('center');
const fontSize = ref(24);
const color = ref('#000000');
const resultUrl = ref('');
const processing = ref(false);
const error = ref('');

const positionOptions = computed(() => [
  { label: t('tools.pdfEditor.position.topLeft'), value: 'top-left' },
  { label: t('tools.pdfEditor.position.topCenter'), value: 'top-center' },
  { label: t('tools.pdfEditor.position.topRight'), value: 'top-right' },
  { label: t('tools.pdfEditor.position.center'), value: 'center' },
  { label: t('tools.pdfEditor.position.bottomLeft'), value: 'bottom-left' },
  { label: t('tools.pdfEditor.position.bottomCenter'), value: 'bottom-center' },
  { label: t('tools.pdfEditor.position.bottomRight'), value: 'bottom-right' },
]);

function onFile(f: File | null) { if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); file.value = f; resultUrl.value = ''; error.value = ''; }

// Any edit invalidates a previously generated PDF; keep the download in sync
// with the current inputs.
watch([text, position, fontSize, color], () => {
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
  resultUrl.value = '';
});

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

function download() {
  if (resultUrl.value) {
    const a = document.createElement('a');
    a.href = resultUrl.value;
    a.download = 'edited.pdf';
    a.click();
  }
}

async function apply() {
  if (!file.value || !text.value) return;
  processing.value = true;
  error.value = '';
  try {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
    const buf = await file.value.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const [r, g, b] = hexToRgb(color.value);
    const pages = doc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text.value, fontSize.value);
      const textHeight = font.heightAtSize(fontSize.value);
      const margin = 20;
      let x = margin;
      let y = height - fontSize.value - margin;

      const pos = position.value;
      if (pos.includes('center') && pos.startsWith('top')) {
        x = (width - textWidth) / 2;
        y = height - fontSize.value - margin;
      } else if (pos.includes('right') && pos.startsWith('top')) {
        x = width - textWidth - margin;
        y = height - fontSize.value - margin;
      } else if (pos === 'center') {
        x = (width - textWidth) / 2;
        y = (height + textHeight) / 2;
      } else if (pos.includes('center') && pos.startsWith('bottom')) {
        x = (width - textWidth) / 2;
        y = margin;
      } else if (pos.includes('left') && pos.startsWith('bottom')) {
        x = margin;
        y = margin;
      } else if (pos.includes('right') && pos.startsWith('bottom')) {
        x = width - textWidth - margin;
        y = margin;
      } else if (pos === 'top-left') {
        x = margin;
        y = height - fontSize.value - margin;
      }

      page.drawText(text.value, {
        x, y,
        size: fontSize.value,
        font,
        color: rgb(r, g, b),
      });
    }

    const bytes = await doc.save();
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
    resultUrl.value = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  } catch (e: any) {
    error.value = e.message || t('tools.pdfEditor.failed');
  }
  processing.value = false;
}
onUnmounted(() => { if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); });
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :max="1" accept=".pdf" @update:file-list="onFile($event[0]?.file)" />
      <NInput v-model:value="text" :placeholder="t('tools.pdfEditor.textPlaceholder')"  :input-props="{ id: 'pdfEditorField0' }"/>
      <NSelect v-model:value="position" :options="positionOptions" :placeholder="t('tools.pdfEditor.positionPlaceholder')" />
      <NSpace>
        <NInputNumber v-model:value="fontSize" :min="8" :max="120" :placeholder="t('tools.pdfEditor.fontSize')" style="width: 150px;"  :input-props="{ id: 'pdfEditorField1' }"/>
        <NColorPicker v-model:value="color" style="width: 100px;" />
      </NSpace>
      <NButton type="primary" :loading="processing" @click="apply" :disabled="!file || !text">
        {{ t('common.apply') }}
      </NButton>
      <NAlert v-if="error" type="error" :title="error" />
      <NButton v-if="resultUrl" @click="download">{{ t('tools.pdfEditor.downloadEditedPdf') }}</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
