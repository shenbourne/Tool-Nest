<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NUpload, NInputNumber, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

interface PageImage {
  url: string;
  page: number;
}

const file = ref<File | null>(null);
const scale = ref(2);
const processing = ref(false);
const error = ref('');
const images = ref<PageImage[]>([]);

function onFile(f: File | null) {
  file.value = f;
  images.value = [];
  error.value = '';
}

function downloadImage(img: PageImage) {
  const a = document.createElement('a');
  a.href = img.url;
  a.download = `page-${img.page}.png`;
  a.click();
}

async function convert() {
  if (!file.value) return;
  processing.value = true;
  error.value = '';
  images.value = [];
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
    const buf = await file.value.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const result: PageImage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: scale.value });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
      result.push({ url: URL.createObjectURL(blob), page: i });
    }
    images.value = result;
  } catch (e: any) {
    error.value = e.message || t('tools.pdfToPng.failed');
  }
  processing.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :max="1" accept=".pdf" @update:file-list="onFile($event[0]?.file)" />
      <NSpace align="center">
        <span>{{ t('tools.pdfToPng.scale') }}</span>
        <NInputNumber v-model:value="scale" :min="1" :max="5" :step="0.5" style="width: 120px;"  :input-props="{ id: 'pdfToPngField0' }"/>
      </NSpace>
      <NButton type="primary" :loading="processing" @click="convert" :disabled="!file">
        {{ t('tools.pdfToPng.convert') }}
      </NButton>
      <NAlert v-if="error" type="error" :title="error" />
      <NSpace v-if="images.length" :wrap="true">
        <NCard v-for="img in images" :key="img.page" :title="t('common.page', { n: img.page })" size="small" style="width: 200px;">
          <img :src="img.url" style="width: 100%;" />
          <NButton size="small" @click="downloadImage(img)" style="margin-top: 8px;">
            {{ t('tool.downloadPng') }}
          </NButton>
        </NCard>
      </NSpace>
    </NSpace></NCard>
  </ToolLayout>
</template>
