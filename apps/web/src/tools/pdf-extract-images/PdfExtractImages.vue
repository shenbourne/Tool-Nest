<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { tool } from './index';

const { t } = useI18n();

interface PageImage {
  url: string;
  page: number;
}

const file = ref<File | null>(null);
const processing = ref(false);
const error = ref('');
const images = ref<PageImage[]>([]);
const progress = ref('');

function revokeImages() {
  for (const img of images.value) URL.revokeObjectURL(img.url);
}

function onFile(files: File[]) {
  const f = files[0] ?? null;
  revokeImages();
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

async function extract() {
  if (!file.value) return;
  processing.value = true;
  error.value = '';
  revokeImages();
  images.value = [];
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
    const buf = await file.value.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const result: PageImage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      progress.value = t('tools.pdfExtractImages.progress', { current: i, total: pdf.numPages });
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
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
    error.value = e.message || t('tools.pdfExtractImages.failed');
  }
  progress.value = '';
  processing.value = false;
}
onUnmounted(() => revokeImages());
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <ToolFileUpload accept=".pdf" @change="onFile" />
      <NButton type="primary" :loading="processing" @click="extract" :disabled="!file">
        {{ t('tools.pdfExtractImages.extract') }}
      </NButton>
      <NAlert v-if="error" type="error" :title="error" />
      <NAlert v-if="progress" type="info" :title="progress" />
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
