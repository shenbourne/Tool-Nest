<script setup lang="ts">
import { ref, watch } from 'vue';
import { NCard, NSpace, NButton, NInputNumber, NAlert } from 'naive-ui';
import FileCard from '@/components/FileCard.vue';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import { tool } from './index';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

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
const imageFiles = ref<{ page: number; file: File }[]>([]);

function onFile(files: File[]) {
  const f = files[0] ?? null;
  file.value = f;
  images.value = [];
  imageFiles.value = [];
  error.value = '';
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
  } catch (e: unknown) {
    error.value = (e instanceof Error ? e.message : '') || t('tools.pdfToPng.failed');
  }
  processing.value = false;
}

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
      <ToolFilePanel output-multiple @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <ToolFileUpload ref="fileUpload" accept=".pdf" @change="onFile" />
        </template>
        <template #output-files>
          <FileCard v-for="(imgFile, idx) in imageFiles" :key="idx" :name="`page-${imgFile.page}.png`" :file="imgFile.file" file-type="image/png" />
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NSpace align="center">
              <span>{{ t('tools.pdfToPng.scale') }}</span>
              <NInputNumber v-model:value="scale" :min="1" :max="5" :step="0.5" style="width: 120px;" :input-props="{ id: 'pdfToPngField0' }" />
            </NSpace>
            <NButton type="primary" :loading="processing" @click="convert" :disabled="!file" block>
              {{ t('tools.pdfToPng.convert') }}
            </NButton>
            <NAlert v-if="error" type="error" :title="error" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>

