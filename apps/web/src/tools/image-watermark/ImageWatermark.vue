<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInput, NUpload } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const file = ref<File | null>(null);
const text = ref('Watermark');
const resultUrl = ref('');
const processing = ref(false);
function onFile(f: File | null) { file.value = f; resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'watermarked'; a.click(); } }
async function process() {
  if (!file.value) return;
  processing.value = true;
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    ctx.font = Math.max(16, img.width / 20) + 'px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText(text.value, canvas.width/2, canvas.height/2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText(text.value, canvas.width/2+2, canvas.height/2+2);
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
      <NInput v-model:value="text" :placeholder="t('tools.imageWatermark.watermarkPlaceholder')" style="width:250px" />
      <NButton type="primary" :loading="processing" @click="process" :disabled="!file">{{ t('tools.imageWatermark.addWatermark') }}</NButton>
      <img v-if="resultUrl" :src="resultUrl" style="max-width:100%;max-height:300px;" />
      <NButton v-if="resultUrl" @click="download">{{ t('tool.download') }}</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
