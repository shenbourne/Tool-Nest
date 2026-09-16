<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NSwitch, NUpload } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const file = ref<File | null>(null);
const horizontal = ref(true);
const vertical = ref(false);
const resultUrl = ref('');
const processing = ref(false);
function onFile(f: File | null) { file.value = f; resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'flipped'; a.click(); } }
async function process() {
  if (!file.value) return;
  processing.value = true;
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(horizontal.value ? -1 : 1, vertical.value ? -1 : 1);
    ctx.drawImage(img, horizontal.value ? -img.width : 0, vertical.value ? -img.height : 0);
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
      <NSpace><NSwitch v-model:value="horizontal">Horizontal</NSwitch><NSwitch v-model:value="vertical">Vertical</NSwitch></NSpace>
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">Flip</NButton>
      <img v-if="resultUrl" :src="resultUrl" style="max-width:100%;max-height:300px;" />
      <NButton v-if="resultUrl" @click="download">Download</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
