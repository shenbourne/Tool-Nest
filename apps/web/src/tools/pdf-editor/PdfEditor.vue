<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NUpload, NInput, NInputNumber, NSelect, NColorPicker, NAlert } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const file = ref<File | null>(null);
const text = ref('');
const position = ref<string>('center');
const fontSize = ref(24);
const color = ref('#000000');
const resultUrl = ref('');
const processing = ref(false);
const error = ref('');

const positionOptions = [
  { label: 'Top Left', value: 'top-left' },
  { label: 'Top Center', value: 'top-center' },
  { label: 'Top Right', value: 'top-right' },
  { label: 'Center', value: 'center' },
  { label: 'Bottom Left', value: 'bottom-left' },
  { label: 'Bottom Center', value: 'bottom-center' },
  { label: 'Bottom Right', value: 'bottom-right' },
];

function onFile(f: File | null) { file.value = f; resultUrl.value = ''; error.value = ''; }

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
    resultUrl.value = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  } catch (e: any) {
    error.value = e.message || 'Failed to edit PDF';
  }
  processing.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :max="1" accept=".pdf" @update:file-list="onFile($event[0]?.file)" />
      <NInput v-model:value="text" placeholder="Enter text to add" />
      <NSelect v-model:value="position" :options="positionOptions" placeholder="Select position" />
      <NSpace>
        <NInputNumber v-model:value="fontSize" :min="8" :max="120" placeholder="Font size" style="width: 150px;" />
        <NColorPicker v-model:value="color" style="width: 100px;" />
      </NSpace>
      <NButton type="primary" :loading="processing" @click="apply" :disabled="!file || !text">
        Apply
      </NButton>
      <NAlert v-if="error" type="error" :title="error" />
      <NButton v-if="resultUrl" @click="download">Download Edited PDF</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
