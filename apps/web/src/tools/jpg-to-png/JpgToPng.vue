<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { useCopy } from '@/composables/useCopy';

const { t } = useI18n();
const tool = useCurrentTool();
const { copyFileToClipboard } = useCopy();

const file = ref<File | null>(null);
const imageUrl = ref<string>('');
const error = ref('');

function onFileChange(files: File[]) {
  const f = files[0] ?? null;
  file.value = f;
  imageUrl.value = f ? URL.createObjectURL(f) : '';
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

function download() {
  if (!file.value) return;
  error.value = '';
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = createCanvas(img);
    if (!canvas) { error.value = t('common.processingFailed'); return; }
    canvas.toBlob((blob) => {
      if (!blob) { error.value = t('common.processingFailed'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };
  img.onerror = () => { error.value = t('common.processingFailed'); };
  img.src = imageUrl.value;
}

async function copy() {
  if (!file.value) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = async () => {
    const canvas = createCanvas(img);
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      await copyFileToClipboard(blob);
    }, 'image/png');
  };
  img.src = imageUrl.value;
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.jpgToPng.name')">
        <NSpace vertical :size="12">
          <ToolFileUpload accept="image/jpeg" @change="onFileChange" />
          <div v-if="imageUrl">
            <img :src="imageUrl" style="max-width:100%;" />
          </div>
          <NSpace><NButton type="primary" :disabled="!file" @click="download">{{ t('tools.jpgToPng.downloadAsPng') }}</NButton><NButton :disabled="!file" @click="copy">{{ t('tool.copyFile') }}</NButton></NSpace>
          <NAlert v-if="error" type="error" :title="error" />
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
