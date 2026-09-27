<script setup lang="ts">
import { ref, watch } from 'vue';
import { NCard, NSpace, NButton, NInputNumber, NColorPicker } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const tool = useCurrentTool();

const file = ref<File | null>(null);
const imageUrl = ref<string>('');
const targetColor = ref('#ffffff');
const tolerance = ref(30);
const canvasRef = ref<HTMLCanvasElement | null>(null);

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const f = input.files?.[0];
  if (f) {
    file.value = f;
    if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
    imageUrl.value = URL.createObjectURL(f);
  }
}

function hexToRgb(hex: string) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 255, g: 255, b: 255 };
}

function processImage() {
  if (!file.value) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const target = hexToRgb(targetColor.value);
    const tol = tolerance.value * 2.55;
    for (let i = 0; i < data.length; i += 4) {
      const dr = data[i] - target.r;
      const dg = data[i + 1] - target.g;
      const db = data[i + 2] - target.b;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist <= tol) {
        data[i + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };
  img.src = imageUrl.value;
}

watch([targetColor, tolerance], () => {
  if (file.value) processImage();
});

function download() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transparent.png';
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
onUnmounted(() => {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
});
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.imageCreateTransparent.name')">
        <NSpace vertical :size="12">
          <div>
            <label for="file-upload">{{ t('common.uploadFile', 'Upload an image') }}</label>
            <input id="file-upload" type="file" accept="image/*" @change="onFileChange" style="display:block;margin-top:8px;" />
          </div>
          <div v-if="file" style="background:repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 20px 20px;">
            <canvas ref="canvasRef" style="max-width:100%;" />
          </div>
        </NSpace>
      </NCard>
      <NCard :title="t('common.settings', 'Settings')">
        <NSpace vertical :size="12">
          <div>
            <label>{{ t('tools.imageCreateTransparent.targetColor') }}</label>
            <NColorPicker v-model:value="targetColor" style="width:200px;" />
          </div>
          <div>
            <label>{{ t('tools.imageCreateTransparent.toleranceRange') }}</label>
            <NInputNumber v-model:value="tolerance" :min="0" :max="100" :step="1" />
          </div>
          <NButton type="primary" :disabled="!file" @click="processImage">{{ t('common.apply') }}</NButton>
          <NButton type="success" :disabled="!file" @click="download">{{ t('tool.download') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
