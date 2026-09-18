<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { NCard, NSpace, NButton, NInputNumber, NColorPicker } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const tool = useCurrentTool();

const file = ref<File | null>(null);
const imageUrl = ref<string>('');
const originalImageEl = ref<HTMLImageElement | null>(null);
const processedImageUrl = ref<string>('');
const stageWidth = ref(800);
const stageHeight = ref(600);

const targetColor = ref('#ffffff');
const tolerance = ref(40);

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const f = input.files?.[0];
  if (f) {
    file.value = f;
    imageUrl.value = URL.createObjectURL(f);
  }
}

function onImageLoad(e: Event) {
  const img = (e.target as HTMLImageElement);
  originalImageEl.value = img;
  const maxW = 800;
  const maxH = 600;
  const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
  stageWidth.value = Math.round(img.naturalWidth * scale);
  stageHeight.value = Math.round(img.naturalHeight * scale);
  processImage();
}

const processedImageEl = computed<HTMLImageElement>(() => {
  const img = new window.Image();
  img.src = processedImageUrl.value;
  return img;
});

function hexToRgb(hex: string) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : { r: 255, g: 255, b: 255 };
}

function processImage() {
  if (!originalImageEl.value) return;
  const img = originalImageEl.value;
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const target = hexToRgb(targetColor.value);
  // Tolerance 0-100 maps to max color distance 0 ~ 441.67 (sqrt(255^2 * 3))
  const maxDist = tolerance.value * 4.4167;

  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - target.r;
    const dg = data[i + 1] - target.g;
    const db = data[i + 2] - target.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist <= maxDist) {
      // Gradient: closer to target = more transparent
      const ratio = dist / maxDist;
      data[i + 3] = Math.round(255 * ratio);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  processedImageUrl.value = canvas.toDataURL('image/png');
}

watch([targetColor, tolerance], () => {
  if (file.value) processImage();
});

function download() {
  if (!processedImageUrl.value) return;
  const a = document.createElement('a');
  a.href = processedImageUrl.value;
  a.download = 'no-background.png';
  a.click();
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.imageRemoveBackground.name')">
        <NSpace vertical :size="12">
          <div>
            <label for="rmbg-file-upload">{{ t('common.uploadFile', 'Upload an image') }}</label>
            <input id="rmbg-file-upload" type="file" accept="image/*" @change="onFileChange" style="display:block;margin-top:8px;" />
          </div>
          <div v-if="processedImageUrl" style="background:repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 20px 20px;">
            <v-stage :config="{ width: stageWidth, height: stageHeight }">
              <v-layer>
                <v-image
                  :config="{
                    image: originalImageEl,
                    x: 0,
                    y: 0,
                    width: stageWidth,
                    height: stageHeight,
                  }"
                  @load="onImageLoad"
                />
              </v-layer>
              <v-layer>
                <v-image
                  :config="{
                    image: processedImageEl,
                    x: 0,
                    y: 0,
                    width: stageWidth,
                    height: stageHeight,
                  }"
                />
              </v-layer>
            </v-stage>
          </div>
        </NSpace>
      </NCard>

      <NCard :title="t('common.settings', 'Settings')">
        <NSpace vertical :size="12">
          <div>
            <label>Background Color: </label>
            <NColorPicker v-model:value="targetColor" style="width:200px;" />
          </div>
          <div>
            <label>Tolerance (0-100): </label>
            <NInputNumber v-model:value="tolerance" :min="0" :max="100" :step="1" style="width:200px;" />
          </div>
          <NButton type="primary" :disabled="!file" @click="processImage">Apply</NButton>
          <NButton type="success" :disabled="!processedImageUrl" @click="download">{{ t('common.download', 'Download') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
