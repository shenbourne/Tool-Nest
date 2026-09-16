<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInputNumber, NUpload, NAlert } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const file = ref<File | null>(null);
const quality = ref(0.7);
const resultUrl = ref('');
const origSize = ref(0);
const newSize = ref(0);
const processing = ref(false);
function onFile(f: File | null) { file.value = f; resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'compressed'; a.click(); } }
async function process() {
  if (!file.value) return;
  processing.value = true;
  origSize.value = file.value.size;
  const canvas = document.createElement('canvas');
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width; canvas.height = img.height;
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    canvas.toBlob(blob => {
      if (blob) { newSize.value = blob.size; resultUrl.value = URL.createObjectURL(blob); }
      processing.value = false;
    }, file.value!.type === 'image/png' ? 'image/png' : 'image/jpeg', quality.value);
  };
  img.src = URL.createObjectURL(file.value);
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :max="1" accept="image/*" @update:file-list="onFile($event[0]?.file)" />
      <NInputNumber v-model:value="quality" :min="0.1" :max="1" :step="0.1" placeholder="Quality" style="width:140px" />
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">Compress</NButton>
      <NAlert v-if="origSize" type="info" :title="'Original: ' + (origSize/1024).toFixed(1) + ' KB → New: ' + (newSize/1024).toFixed(1) + ' KB'" />
      <img v-if="resultUrl" :src="resultUrl" style="max-width:100%;max-height:300px;" />
      <NButton v-if="resultUrl" @click="download">Download</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
