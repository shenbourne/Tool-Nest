<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInputNumber, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { tool } from './index';
import { useCopy } from '@/composables/useCopy';

const { t } = useI18n();
const { copyFileToClipboard } = useCopy();
const file = ref<File | null>(null);
const width = ref(800);
const height = ref(600);
const resultUrl = ref('');
const processing = ref(false);
function onFile(files: File[]) { file.value = files[0] ?? null; resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'resized'; a.click(); } }
async function copy() {
  if (!resultUrl.value) return;
  const res = await fetch(resultUrl.value);
  const blob = await res.blob();
  await copyFileToClipboard(blob);
}
async function process() {
  if (!file.value) return;
  processing.value = true;
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width.value; canvas.height = height.value;
    canvas.getContext('2d')!.drawImage(img, 0, 0, width.value, height.value);
    resultUrl.value = canvas.toDataURL(file.value!.type || 'image/png');
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
      <NSpace><NInputNumber v-model:value="width" :min="1" :placeholder="t('common.width')" style="width:120px"  :input-props="{ id: 'imageResizeField0' }"/><NInputNumber v-model:value="height" :min="1" :placeholder="t('common.height')" style="width:120px"  :input-props="{ id: 'imageResizeField1' }"/></NSpace>
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">{{ t('tools.imageResize.resize') }}</NButton>
      <img v-if="resultUrl" :src="resultUrl" style="max-width:100%;max-height:300px;" />
      <NSpace><NButton v-if="resultUrl" @click="download">{{ t('tool.download') }}</NButton><NButton v-if="resultUrl" @click="copy">{{ t('tool.copyFile') }}</NButton></NSpace>
    </NSpace></NCard>
  </ToolLayout>
</template>
