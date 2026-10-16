<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NButton, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import FileCard from '@/components/FileCard.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const { copyFileToClipboard } = useCopy();
const file = ref<File | null>(null);
const width = ref(800);
const height = ref(600);
const resultFile = ref<File | null>(null);
const resultThumbnail = computed(() => resultFile.value ? URL.createObjectURL(resultFile.value) : '');
const processing = ref(false);
function onFile(files: File[]) { file.value = files[0] ?? null; resultFile.value = null; }
function download() {
  if (!resultFile.value) return;
  const url = URL.createObjectURL(resultFile.value);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resized';
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
    canvas.width = width.value; canvas.height = height.value;
    canvas.getContext('2d')!.drawImage(img, 0, 0, width.value, height.value);
    const mime = file.value!.type || 'image/png';
    canvas.toBlob((blob) => {
      if (blob) {
        resultFile.value = new File([blob], 'resized.png', { type: mime });
      }
      URL.revokeObjectURL(objectUrl);
      processing.value = false;
    }, mime);
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
          <FileCard v-if="resultFile" name="resized.png" :file="resultFile" :thumbnail-url="resultThumbnail" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultFile" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!resultFile" @click="download">{{ t('tool.exportFile') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NSpace>              <div class="tool-numeric-param">
                <label for="imageResizeField0">{{ t('numericParams.widthPixels') }}:</label>
                <NInputNumber v-model:value="width" :min="1" :placeholder="t('common.width')" style="width:120px" :input-props="{ id: 'imageResizeField0' }"/>
              </div>              <div class="tool-numeric-param">
                <label for="imageResizeField1">{{ t('numericParams.heightPixels') }}:</label>
                <NInputNumber v-model:value="height" :min="1" :placeholder="t('common.height')" style="width:120px" :input-props="{ id: 'imageResizeField1' }"/>
              </div>
            </NSpace>
            <NButton type="primary" :loading="processing" @click="process" :disabled="!file" block>
              {{ t('tools.imageResize.resize') }}
            </NButton>
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
