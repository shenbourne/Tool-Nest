<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NButton, NInputNumber, NAlert } from 'naive-ui';
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
const quality = ref(0.7);
const resultFile = ref<File | null>(null);
const resultThumbnail = computed(() => resultFile.value ? URL.createObjectURL(resultFile.value) : '');
const origSize = ref(0);
const newSize = ref(0);
const processing = ref(false);
function onFile(files: File[]) { file.value = files[0] ?? null; resultFile.value = null; }
function download() {
  if (!resultFile.value) return;
  const url = URL.createObjectURL(resultFile.value);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'compressed';
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
  origSize.value = file.value.size;
  const canvas = document.createElement('canvas');
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width; canvas.height = img.height;
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    canvas.toBlob(blob => {
      if (blob) {
        newSize.value = blob.size;
        const mime = file.value!.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resultFile.value = new File([blob], 'compressed.png', { type: mime });
      }
      URL.revokeObjectURL(objectUrl);
      processing.value = false;
    }, file.value!.type === 'image/png' ? 'image/png' : 'image/jpeg', quality.value);
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
          <FileCard v-if="resultFile" name="compressed.png" :file="resultFile" :thumbnail-url="resultThumbnail" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultFile" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!resultFile" @click="download">{{ t('tool.download') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">            <div class="tool-numeric-param">
              <label for="imageCompressField0">{{ t('numericParams.quality') }}:</label>
              <NInputNumber v-model:value="quality" :min="0.1" :max="1" :step="0.1" :placeholder="t('tools.imageCompress.quality')" style="width:140px"  :input-props="{ id: 'imageCompressField0' }"/>
            </div>
            <NButton type="primary" :loading="processing" @click="process" :disabled="!file" block>
              {{ t('tools.imageCompress.compress') }}
            </NButton>
            <NAlert v-if="origSize" type="info" :title="t('tools.imageCompress.sizeInfo', { orig: (origSize/1024).toFixed(1), next: (newSize/1024).toFixed(1) })" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
