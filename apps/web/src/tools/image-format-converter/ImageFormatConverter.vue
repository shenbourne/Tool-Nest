<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import { NCard, NSpace, NButton, NSelect, NFormItem, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import FileCard from '@/components/FileCard.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';

const { t } = useI18n();
const { copyFileToClipboard } = useCopy();
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);
const file = ref<File | null>(null);
const format = ref<'png' | 'jpg' | 'webp'>('png');
const formats = [{ label: 'PNG', value: 'png' }, { label: 'JPG', value: 'jpg' }, { label: 'WebP', value: 'webp' }];
const resultFile = ref<File | null>(null);
const resultThumbnail = ref('');
const error = ref('');
const processing = ref(false);
let revision = 0;
function clearResult() {
  revision++;
  processing.value = false;
  resultFile.value = null;
  error.value = '';
  if (resultThumbnail.value) URL.revokeObjectURL(resultThumbnail.value);
  resultThumbnail.value = '';
}
function onFile(files: File[]) { clearResult(); file.value = files[0] ?? null; }
watch(format, clearResult);
onBeforeUnmount(clearResult);

async function process() {
  const input = file.value;
  if (!input || processing.value) return;
  clearResult();
  const current = revision;
  const target = format.value;
  const mime = target === 'jpg' ? 'image/jpeg' : `image/${target}`;
  const url = URL.createObjectURL(input);
  processing.value = true;
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image decoding failed'));
      img.src = url;
    });
    if (current !== revision) return;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    if (target === 'jpg') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, mime, 0.92));
    if (current !== revision) return;
    if (!blob || blob.type !== mime) throw new Error('Image encoding failed');
    const name = `${input.name.replace(/\.[^.]+$/, '') || 'converted'}.${target}`;
    resultFile.value = new File([blob], name, { type: mime });
    resultThumbnail.value = URL.createObjectURL(resultFile.value);
  } catch {
    if (current === revision) error.value = t('common.processingFailed');
  } finally {
    URL.revokeObjectURL(url);
    if (current === revision) processing.value = false;
  }
}
function download() {
  if (!resultFile.value) return;
  const a = document.createElement('a');
  a.href = resultThumbnail.value;
  a.download = resultFile.value.name;
  a.click();
}
async function copy() {
  if (resultFile.value) await copyFileToClipboard(resultFile.value);
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
          <FileCard v-if="resultFile" :name="resultFile.name" :file="resultFile" :file-type="resultFile.type" :thumbnail-url="resultThumbnail" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultFile" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!resultFile" @click="download">{{ t('tool.exportFile') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NFormItem :label="t('tools.imageFormatConverter.format')" :show-feedback="false">
              <NSelect v-model:value="format" :options="formats" />
            </NFormItem>
            <NAlert v-if="error" type="error">{{ error }}</NAlert>
            <NButton type="primary" :loading="processing" :disabled="!file || processing" block @click="process">
              {{ t('tools.imageFormatConverter.convert') }}
            </NButton>
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
