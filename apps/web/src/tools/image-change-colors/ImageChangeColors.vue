<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { NCard, NSpace, NButton, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { useCopy } from '@/composables/useCopy';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const tool = useCurrentTool();
const { copyFileToClipboard } = useCopy();

const file = ref<File | null>(null);
const imageUrl = ref<string>('');
const hueRotate = ref(0);
const saturate = ref(100);
const brightness = ref(100);
const contrast = ref(100);

const filterStyle = computed(() => {
  return `hue-rotate(${hueRotate.value}deg) saturate(${saturate.value}%) brightness(${brightness.value}%) contrast(${contrast.value}%)`;
});

function onFileChange(files: File[]) {
  const f = files[0] ?? null;
  file.value = f;
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  imageUrl.value = f ? URL.createObjectURL(f) : '';
}

function createCanvas(img: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.filter = filterStyle.value;
  ctx.drawImage(img, 0, 0);
  return canvas;
}

function download() {
  if (!file.value) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = createCanvas(img);
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'image-changed.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };
  img.src = imageUrl.value;
}

async function copy() {
  if (!file.value) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = createCanvas(img);
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      await copyFileToClipboard(blob);
    }, 'image/png');
  };
  img.src = imageUrl.value;
}
onUnmounted(() => {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
});
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <ToolFileUpload ref="fileUpload" accept="image/*" compact @change="onFileChange" />
        </template>
        <template #output-files>
          <div v-if="imageUrl">
            <img :src="imageUrl" :style="{ filter: filterStyle, maxWidth: '100%' }" />
          </div>
        </template>
        <template #actions-right>
          <NButton :disabled="!file" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!file" @click="download">{{ t('tool.download') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <div>
              <label :for="'imageChangeColorsField0'">{{ t('tools.imageChangeColors.hueRotate') }}</label>
              <NInputNumber v-model:value="hueRotate" :min="0" :max="360" :step="1"  :input-props="{ id: 'imageChangeColorsField0' }"/>
            </div>
            <div>
              <label :for="'imageChangeColorsField1'">{{ t('tools.imageChangeColors.saturate') }}</label>
              <NInputNumber v-model:value="saturate" :min="0" :max="200" :step="1"  :input-props="{ id: 'imageChangeColorsField1' }"/>
            </div>
            <div>
              <label :for="'imageChangeColorsField2'">{{ t('tools.imageChangeColors.brightness') }}</label>
              <NInputNumber v-model:value="brightness" :min="0" :max="200" :step="1"  :input-props="{ id: 'imageChangeColorsField2' }"/>
            </div>
            <div>
              <label :for="'imageChangeColorsField3'">{{ t('tools.imageChangeColors.contrast') }}</label>
              <NInputNumber v-model:value="contrast" :min="0" :max="200" :step="1"  :input-props="{ id: 'imageChangeColorsField3' }"/>
            </div>
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
