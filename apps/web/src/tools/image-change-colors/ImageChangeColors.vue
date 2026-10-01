<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { NCard, NSpace, NButton, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import FileCard from '@/components/FileCard.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { useCopy } from '@/composables/useCopy';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const tool = useCurrentTool();
const { copyFileToClipboard } = useCopy();

const file = ref<File | null>(null);
const imageUrl = ref<string>('');
const resultFile = ref<File | null>(null);
const resultThumbnail = computed(() => resultFile.value ? URL.createObjectURL(resultFile.value) : '');
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
  resultFile.value = null;
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

let regenGeneration = 0;
function regenerate() {
  if (!file.value || !imageUrl.value) return;
  const gen = ++regenGeneration;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = createCanvas(img);
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (gen !== regenGeneration) return;
      if (blob) {
        resultFile.value = new File([blob], 'image-changed.png', { type: 'image/png' });
      }
    }, 'image/png');
  };
  img.src = imageUrl.value;
}

function download() {
  if (!resultFile.value) return;
  const url = URL.createObjectURL(resultFile.value);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'image-changed.png';
  a.click();
  URL.revokeObjectURL(url);
}

async function copy() {
  if (!resultFile.value) return;
  await copyFileToClipboard(resultFile.value);
}

watchEffect(regenerate);
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <ToolFileUpload ref="fileUpload" accept="image/*" compact @change="onFileChange" :removable="false" />
        </template>
        <template #output-files>
          <FileCard v-if="resultFile" name="image-changed.png" :file="resultFile" file-type="image/png" :thumbnail-url="resultThumbnail" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultFile" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!resultFile" @click="download">{{ t('tool.download') }}</NButton>
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
