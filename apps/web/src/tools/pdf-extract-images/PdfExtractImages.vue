<script setup lang="ts">
import { ref, watch } from 'vue';
import { NCard, NSpace, NButton, NAlert } from 'naive-ui';
import FileCard from '@/components/FileCard.vue';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const { copyFileToClipboard } = useCopy();

interface PageImage {
  url: string;
  page: number;
}

const file = ref<File | null>(null);
const processing = ref(false);
const error = ref('');
const images = ref<PageImage[]>([]);
const imageFiles = ref<{ page: number; file: File }[]>([]);
const progress = ref('');

function revokeImages() {
  for (const img of images.value) URL.revokeObjectURL(img.url);
}

function onFile(files: File[]) {
  const f = files[0] ?? null;
  revokeImages();
  file.value = f;
  images.value = [];
  imageFiles.value = [];
  error.value = '';
}

function downloadImage(img: PageImage) {
  const a = document.createElement('a');
  a.href = img.url;
  a.download = `page-${img.page}.png`;
  a.click();
}

async function copyImage(img: PageImage) {
  const res = await fetch(img.url);
  const blob = await res.blob();
  await copyFileToClipboard(blob);
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

watch(images, async (newImages) => {
  if (!newImages.length) {
    imageFiles.value = [];
    return;
  }
  const files: { page: number; file: File }[] = [];
  for (const img of newImages) {
    const res = await fetch(img.url);
    const blob = await res.blob();
    files.push({ page: img.page, file: new File([blob], `page-${img.page}.png`, { type: 'image/png' }) });
  }
  imageFiles.value = files;
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <ToolFileUpload ref="fileUpload" accept=".pdf" compact @change="onFile" :removable="false" />
        </template>
        <template #output-files>
          <div v-if="imageFiles.length" class="tool-file-panel__output-grid">
            <FileCard v-for="(imgFile, idx) in imageFiles" :key="idx" :name="`page-${imgFile.page}.png`" :file="imgFile.file" file-type="image/png" />
          </div>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NButton type="primary" :loading="processing" @click="extract" :disabled="!file" block>
              {{ t('tools.pdfExtractImages.extract') }}
            </NButton>
            <NAlert v-if="error" type="error" :title="error" />
            <NAlert v-if="progress" type="info" :title="progress" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>

<style scoped>
.tool-file-panel__output-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  gap: 8px;
  width: 100%;
}
</style>
