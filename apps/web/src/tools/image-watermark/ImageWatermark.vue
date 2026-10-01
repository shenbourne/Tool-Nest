<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NButton, NInput } from 'naive-ui';
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
const text = ref('Watermark');
const resultFile = ref<File | null>(null);
const resultThumbnail = computed(() => resultFile.value ? URL.createObjectURL(resultFile.value) : '');
const processing = ref(false);
function onFile(files: File[]) { file.value = files[0] ?? null; resultFile.value = null; }
function download() {
  if (!resultFile.value) return;
  const url = URL.createObjectURL(resultFile.value);
  const a = document.createElement('a');
  a.href = url;
  a.download = resultFile.value.name;
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
    ctx.drawImage(img, 0, 0);
    ctx.font = Math.max(16, img.width / 20) + 'px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText(text.value, canvas.width/2, canvas.height/2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText(text.value, canvas.width/2+2, canvas.height/2+2);
    const mime = file.value!.type || 'image/png';
    canvas.toBlob((blob) => {
      if (blob) {
        const ext = (mime.split('/')[1] || 'png').replace('jpeg', 'jpg');
        resultFile.value = new File([blob], `watermarked.${ext}`, { type: mime });
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
          <ToolFileUpload ref="fileUpload" accept="image/*" compact @change="onFile" />
        </template>
        <template #output-files>
          <FileCard v-if="resultFile" :name="resultFile.name" :file="resultFile" :thumbnail-url="resultThumbnail" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultFile" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!resultFile" @click="download">{{ t('tool.download') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NInput v-model:value="text" :placeholder="t('tools.imageWatermark.watermarkPlaceholder')" style="width:250px"  :input-props="{ id: 'imageWatermarkField0' }"/>
            <NButton type="primary" :loading="processing" @click="process" :disabled="!file" block>
              {{ t('tools.imageWatermark.addWatermark') }}
            </NButton>
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
