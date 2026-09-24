<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { NCard, NSpace, NButton, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import Konva from 'konva';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { usePreferencesStore } from '@/stores/preferences.store';
import { resolveCssColorToken } from '@/utils/css-tokens';

const { t } = useI18n();
const tool = useCurrentTool();
const preferences = usePreferencesStore();

// Konva/Canvas cannot resolve CSS `var()` expressions, so the primary tokens have
// to be passed as concrete colors. Token values are declared on `:root` and
// swapped by the `dark` class, hence the store-driven re-resolution: `isDark`
// covers theme toggles and `loaded` covers the initial application of the theme
// class when preferences arrive from the server after mount.
const primaryColor = ref('');
const primarySoftColor = ref('');

watch(
  [() => preferences.isDark, () => preferences.loaded],
  () => {
    primaryColor.value = resolveCssColorToken('--color-primary');
    primarySoftColor.value = resolveCssColorToken('--color-primary-soft');
  },
  { immediate: true, flush: 'post' },
);

const file = ref<File | null>(null);
const imageUrl = ref<string>('');
const imageEl = ref<HTMLImageElement | null>(null);
const stageWidth = ref(800);
const stageHeight = ref(600);
const imageScale = ref(1);

// Crop rectangle state (in image-pixel coordinates)
const cropX = ref(0);
const cropY = ref(0);
const cropWidth = ref(100);
const cropHeight = ref(100);

const transformerRef = ref<any>(null);
const rectNodeRef = ref<any>(null);
const imageNodeRef = ref<any>(null);

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
  imageEl.value = img;

  // Scale to fit within a max display width
  const maxW = 800;
  const maxH = 600;
  const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
  imageScale.value = scale;
  stageWidth.value = Math.round(img.naturalWidth * scale);
  stageHeight.value = Math.round(img.naturalHeight * scale);

  // Init crop rect to center 50% of image
  cropX.value = Math.round(img.naturalWidth * 0.25);
  cropY.value = Math.round(img.naturalHeight * 0.25);
  cropWidth.value = Math.round(img.naturalWidth * 0.5);
  cropHeight.value = Math.round(img.naturalHeight * 0.5);

  nextTick(() => {
    attachTransformer();
  });
}

function attachTransformer() {
  const tr = transformerRef.value;
  const rect = rectNodeRef.value;
  if (tr && rect) {
    const konvaTr = tr.getNode() as Konva.Transformer;
    const konvaRect = rect.getNode() as Konva.Rect;
    konvaTr.nodes([konvaRect]);
    konvaTr.getLayer()?.batchDraw();
  }
}

function onRectTransformEnd() {
  const rect = rectNodeRef.value;
  if (!rect) return;
  const node = rect.getNode() as Konva.Rect;
  const scale = imageScale.value;
  cropX.value = Math.round(node.x() / scale);
  cropY.value = Math.round(node.y() / scale);
  cropWidth.value = Math.round(node.width() * node.scaleX() / scale);
  cropHeight.value = Math.round(node.height() * node.scaleY() / scale);
  // Reset scaleX/scaleY after reading
  node.scaleX(1);
  node.scaleY(1);
  node.width(cropWidth.value * scale);
  node.height(cropHeight.value * scale);
}

// Watch NInputNumber changes to update the rect position
watch([cropX, cropY, cropWidth, cropHeight], () => {
  const rect = rectNodeRef.value;
  if (!rect) return;
  const node = rect.getNode() as Konva.Rect;
  const scale = imageScale.value;
  node.x(cropX.value * scale);
  node.y(cropY.value * scale);
  node.width(cropWidth.value * scale);
  node.height(cropHeight.value * scale);
  node.getLayer()?.batchDraw();
  const tr = transformerRef.value;
  if (tr) {
    (tr.getNode() as Konva.Transformer).forceUpdate();
  }
});

function downloadCrop() {
  if (!imageEl.value) return;
  const canvas = document.createElement('canvas');
  canvas.width = cropWidth.value;
  canvas.height = cropHeight.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.drawImage(
    imageEl.value,
    cropX.value, cropY.value, cropWidth.value, cropHeight.value,
    0, 0, cropWidth.value, cropHeight.value
  );
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cropped.png';
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.imageCrop.name')">
        <NSpace vertical :size="12">
          <div>
            <label for="crop-file-upload">{{ t('common.uploadFile', 'Upload an image') }}</label>
            <input id="crop-file-upload" type="file" accept="image/*" @change="onFileChange" style="display:block;margin-top:8px;" />
          </div>
          <div v-if="imageUrl">
            <v-stage :config="{ width: stageWidth, height: stageHeight }">
              <v-layer>
                <v-image
                  ref="imageNodeRef"
                  :config="{
                    image: imageEl,
                    x: 0,
                    y: 0,
                    width: stageWidth,
                    height: stageHeight,
                  }"
                  @load="onImageLoad"
                />
                <v-rect
                  ref="rectNodeRef"
                  :config="{
                    x: cropX * imageScale,
                    y: cropY * imageScale,
                    width: cropWidth * imageScale,
                    height: cropHeight * imageScale,
                    stroke: primaryColor,
                    strokeWidth: 2,
                    fill: primarySoftColor,
                    draggable: true,
                  }"
                  @transformend="onRectTransformEnd"
                  @dragend="onRectTransformEnd"
                />
                <v-transformer ref="transformerRef" :config="{ rotateEnabled: false, borderStroke: primaryColor, anchorStroke: primaryColor }" />
              </v-layer>
            </v-stage>
          </div>
        </NSpace>
      </NCard>

      <NCard :title="t('common.settings', 'Settings')">
        <NSpace vertical :size="12">
          <NSpace :size="16">
            <div>
              <label>X: </label>
              <NInputNumber v-model:value="cropX" :min="0" :step="1" style="width:120px;" />
            </div>
            <div>
              <label>Y: </label>
              <NInputNumber v-model:value="cropY" :min="0" :step="1" style="width:120px;" />
            </div>
            <div>
              <label>{{ t('common.width') }}: </label>
              <NInputNumber v-model:value="cropWidth" :min="1" :step="1" style="width:120px;" />
            </div>
            <div>
              <label>{{ t('common.height') }}: </label>
              <NInputNumber v-model:value="cropHeight" :min="1" :step="1" style="width:120px;" />
            </div>
          </NSpace>
          <NButton type="primary" :disabled="!file" @click="downloadCrop">{{ t('tools.imageCrop.cropAndDownload') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
