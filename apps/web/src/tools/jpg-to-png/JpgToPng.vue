<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import FileCard from '@/components/FileCard.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { useCopy } from '@/composables/useCopy';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const tool = useCurrentTool();
const { copyFileToClipboard } = useCopy();

const file = ref<File | null>(null);
const imageUrl = ref<string>('');
const resultFile = ref<File | null>(null);
const error = ref('');

function onFileChange(files: File[]) {
  const f = files[0] ?? null;
  file.value = f;
  imageUrl.value = f ? URL.createObjectURL(f) : '';
  resultFile.value = null;
  if (f) process();
}

function createCanvas(img: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  return canvas;
}

function process() {
  if (!file.value) return;
  error.value = '';
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = createCanvas(img);
    if (!canvas) { error.value = t('common.processingFailed'); return; }
    canvas.toBlob((blob) => {
      if (!blob) { error.value = t('common.processingFailed'); return; }
      resultFile.value = new File([blob], 'converted.png', { type: 'image/png' });
    }, 'image/png');
  };
  img.onerror = () => { error.value = t('common.processingFailed'); };
  img.src = imageUrl.value;
}

function download() {
  if (!resultFile.value) return;
  const url = URL.createObjectURL(resultFile.value);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'converted.png';
  a.click();
  URL.revokeObjectURL(url);
}

async function copy() {
  if (!resultFile.value) return;
  await copyFileToClipboard(resultFile.value);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <ToolFileUpload ref="fileUpload" accept="image/jpeg" compact @change="onFileChange" />
        </template>
        <template #output-files>
          <FileCard v-if="resultFile" name="converted.png" :file="resultFile" :thumbnail-url="imageUrl" />
        </template>
        <template #actions-right>
          <NButton :disabled="!file" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton type="primary" :disabled="!file" @click="download">{{ t('tools.jpgToPng.downloadAsPng') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NAlert v-if="error" type="error" :title="error" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
