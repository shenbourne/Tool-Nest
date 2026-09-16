<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInputNumber, NUpload } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const file = ref<File | null>(null);
const opacity = ref(0.5);
const resultUrl = ref('');
const processing = ref(false);
function onFile(f: File | null) { file.value = f; resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'transparent'; a.click(); } }
async function process() {
  if (!file.value) return;
  processing.value = true;
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.globalAlpha = opacity.value;
    ctx.drawImage(img, 0, 0);
    resultUrl.value = canvas.toDataURL('image/png');
    processing.value = false;
  };
  img.src = URL.createObjectURL(file.value);
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :max="1" accept="image/*" @update:file-list="onFile($event[0]?.file)" />
      <NInputNumber v-model:value="opacity" :min="0" :max="1" :step="0.1" style="width:140px" />
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">Apply</NButton>
      <img v-if="resultUrl" :src="resultUrl" style="max-width:100%;max-height:300px;" />
      <NButton v-if="resultUrl" @click="download">Download PNG</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
