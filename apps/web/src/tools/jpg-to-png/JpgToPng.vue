<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const tool = useCurrentTool();

const file = ref<File | null>(null);
const imageUrl = ref<string>('');

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const f = input.files?.[0];
  if (f) {
    file.value = f;
    imageUrl.value = URL.createObjectURL(f);
  }
}

function download() {
  if (!file.value) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.png';
      a.click();
      URL.revokeObjectURL(url);
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
          <div>
            <label for="file-upload">{{ t('common.uploadFile', 'Upload a JPG image') }}</label>
            <input id="file-upload" type="file" accept="image/jpeg" @change="onFileChange" style="display:block;margin-top:8px;" />
          </div>
          <div v-if="imageUrl">
            <img :src="imageUrl" style="max-width:100%;" />
          </div>
          <NButton type="primary" :disabled="!file" @click="download">{{ t('common.download', 'Download as PNG') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
