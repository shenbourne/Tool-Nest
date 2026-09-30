<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { tool } from './index';
import { useCopy } from '@/composables/useCopy';

const { t } = useI18n();
const { copyFileToClipboard } = useCopy();
const file = ref<File | null>(null);
const angle = ref(90);
const resultUrl = ref('');
const processing = ref(false);
function onFile(files: File[]) { file.value = files[0] ?? null; resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'rotated'; a.click(); } }
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
    const rad = angle.value * Math.PI / 180;
    const sin = Math.abs(Math.sin(rad)), cos = Math.abs(Math.cos(rad));
    canvas.width = img.width * cos + img.height * sin;
    canvas.height = img.width * sin + img.height * cos;
    const ctx = canvas.getContext('2d')!;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(rad);
    ctx.drawImage(img, -img.width/2, -img.height/2);
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
      <NInputNumber v-model:value="angle" :min="-360" :max="360" :placeholder="t('tools.imageRotate.degrees')" style="width:140px"  :input-props="{ id: 'imageRotateField0' }"/>
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">{{ t('tools.imageRotate.rotate') }}</NButton>
      <img v-if="resultUrl" :src="resultUrl" style="max-width:100%;max-height:300px;" />
      <NSpace><NButton v-if="resultUrl" @click="download">{{ t('tool.download') }}</NButton><NButton v-if="resultUrl" @click="copy">{{ t('tool.copyFile') }}</NButton></NSpace>
    </NSpace></NCard>
  </ToolLayout>
</template>
