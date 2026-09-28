<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NCard, NSpace, NButton, NInputNumber, NAlert, NImage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const tool = useCurrentTool();

const file = ref<File | null>(null);
const imageUrl = ref<string>('');
const hueRotate = ref(0);
const saturate = ref(100);
const brightness = ref(100);
const contrast = ref(100);

const filterStyle = computed(() => {
  return `hue-rotate(${hueRotate.value}deg) saturate(${saturate.value}%) brightness(${brightness.value}%) contrast(${contrast.value}%)`;
});

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const f = input.files?.[0];
  if (f) {
    file.value = f;
    if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
    imageUrl.value = URL.createObjectURL(f);
  }
}

function download() {
  if (!file.value) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.filter = filterStyle.value;
    ctx.drawImage(img, 0, 0);
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
onUnmounted(() => {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
});
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.imageChangeColors.name')">
        <NSpace vertical :size="12">
          <div>
            <label for="file-upload">{{ t('common.uploadFile', 'Upload an image') }}</label>
            <input id="file-upload" type="file" accept="image/*" @change="onFileChange" style="display:block;margin-top:8px;" />
          </div>
          <div v-if="imageUrl">
            <img :src="imageUrl" :style="{ filter: filterStyle, maxWidth: '100%' }" />
          </div>
        </NSpace>
      </NCard>
      <NCard :title="t('tools.imageChangeColors.name') + ' ' + t('common.settings', 'Settings')">
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
          <NButton type="primary" :disabled="!file" @click="download">{{ t('tool.download') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
