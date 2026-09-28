<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { tool } from './index';

const { t } = useI18n();
const file = ref<File | null>(null);
const opacity = ref(0.5);
const resultUrl = ref('');
const processing = ref(false);
function onFile(files: File[]) { file.value = files[0] ?? null; resultUrl.value = ''; }
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
    URL.revokeObjectURL(objectUrl);
    processing.value = false;
  };
  const objectUrl = URL.createObjectURL(file.value);
  img.onerror = () => { URL.revokeObjectURL(objectUrl); processing.value = false; };
  img.src = objectUrl;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <ToolFileUpload accept="image/*" @change="onFile" />
      <NInputNumber v-model:value="opacity" :min="0" :max="1" :step="0.1" style="width:140px"  :input-props="{ id: 'imageChangeOpacityField0' }"/>
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">{{ t('common.apply') }}</NButton>
      <img v-if="resultUrl" :src="resultUrl" style="max-width:100%;max-height:300px;" />
      <NButton v-if="resultUrl" @click="download">{{ t('tools.imageChangeOpacity.downloadPng') }}</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
