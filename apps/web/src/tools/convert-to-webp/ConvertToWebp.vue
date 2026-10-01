<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton } from 'naive-ui';
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
const resultUrl = ref('');
const resultFile = ref<File | null>(null);
const processing = ref(false);
function onFile(files: File[]) { file.value = files[0] ?? null; resultUrl.value = ''; resultFile.value = null; }
function download() {
  if (!resultFile.value) return;
  const url = URL.createObjectURL(resultFile.value);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'output.webp';
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
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        resultFile.value = new File([blob], 'output.webp', { type: 'image/webp' });
        resultUrl.value = URL.createObjectURL(blob);
      }
      URL.revokeObjectURL(objectUrl);
      processing.value = false;
    }, 'image/webp', 0.92);
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
          <ToolFileUpload ref="fileUpload" accept="image/*" compact @change="onFile" />
        </template>
        <template #output-files>
          <FileCard v-if="resultFile" name="output.webp" :file="resultFile" :thumbnail-url="resultUrl" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultFile" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!resultFile" @click="download">{{ t('tools.convertToWebp.downloadWebp') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NButton type="primary" :loading="processing" @click="process" :disabled="!file" block>
              {{ t('tools.convertToWebp.convert') }}
            </NButton>
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
