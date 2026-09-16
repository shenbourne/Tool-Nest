<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInputNumber, NUpload } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const file = ref<File | null>(null);
const angle = ref(90);
const resultUrl = ref('');
const processing = ref(false);
function onFile(f: File | null) { file.value = f; resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'rotated'; a.click(); } }
async function process() {
  if (!file.value) return;
  processing.value = true;
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const rad = angle.value * Math.PI / 180;
    const sin = Math.abs(Math.sin(rad)), cos = Math.abs(Math.cos(rad));
    canvas.width = img.width * cos + img.height * sin;
    canvas.height = img.width * sin + img.height * cos;
    const ctx = canvas.getContext('2d')!;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(rad);
    ctx.drawImage(img, -img.width/2, -img.height/2);
    resultUrl.value = canvas.toDataURL(file.value!.type || 'image/png');
    processing.value = false;
  };
  img.src = URL.createObjectURL(file.value);
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NUpload :max="1" accept="image/*" @update:file-list="onFile($event[0]?.file)" />
      <NInputNumber v-model:value="angle" :min="-360" :max="360" placeholder="Degrees" style="width:140px" />
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">Rotate</NButton>
      <img v-if="resultUrl" :src="resultUrl" style="max-width:100%;max-height:300px;" />
      <NButton v-if="resultUrl" @click="download">Download</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
