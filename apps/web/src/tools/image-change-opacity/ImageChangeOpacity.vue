<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NButton, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import FileCard from '@/components/FileCard.vue';
import { tool } from './index';
import { useCopy } from '@/composables/useCopy';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const { copyFileToClipboard } = useCopy();
const file = ref<File | null>(null);
const opacity = ref(0.5);
const resultFile = ref<File | null>(null);
const resultThumbnail = computed(() => resultFile.value ? URL.createObjectURL(resultFile.value) : '');
const processing = ref(false);
function onFile(files: File[]) { file.value = files[0] ?? null; resultFile.value = null; }
function download() {
  if (!resultFile.value) return;
  const url = URL.createObjectURL(resultFile.value);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transparent';
  a.click();
  URL.revokeObjectURL(url);
}
async function copy() {
  if (!resultFile.value) return;
  await copyFileToClipboard(resultFile.value);
}
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
    canvas.toBlob((blob) => {
      if (blob) {
        resultFile.value = new File([blob], 'transparent.png', { type: 'image/png' });
      }
      URL.revokeObjectURL(objectUrl);
      processing.value = false;
    }, 'image/png');
  };
  const objectUrl = URL.createObjectURL(file.value);
  img.onerror = () => { URL.revokeObjectURL(objectUrl); processing.value = false; };
  img.src = objectUrl;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <ToolFileUpload ref="fileUpload" accept="image/*" @change="onFile" />
        </template>
        <template #output-files>
          <FileCard v-if="resultFile" name="transparent.png" :file="resultFile" file-type="image/png" :thumbnail-url="resultThumbnail" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultFile" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!resultFile" @click="download">{{ t('tools.imageChangeOpacity.downloadPng') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">            <div class="tool-numeric-param">
              <label for="imageChangeOpacityField0">{{ t('numericParams.opacity') }}:</label>
              <NInputNumber v-model:value="opacity" :min="0" :max="1" :step="0.1" style="width:140px"  :input-props="{ id: 'imageChangeOpacityField0' }"/>
            </div>
            <NButton type="primary" :loading="processing" @click="process" :disabled="!file" block>
              {{ t('common.apply') }}
            </NButton>
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
