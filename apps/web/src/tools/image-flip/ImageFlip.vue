<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NSwitch } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { tool } from './index';
import { useCopy } from '@/composables/useCopy';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const { copyFileToClipboard } = useCopy();
const file = ref<File | null>(null);
const horizontal = ref(true);
const vertical = ref(false);
const resultUrl = ref('');
const processing = ref(false);
function onFile(files: File[]) { file.value = files[0] ?? null; resultUrl.value = ''; }
function download() { if (resultUrl.value) { const a = document.createElement('a'); a.href = resultUrl.value; a.download = 'flipped'; a.click(); } }
async function copy() {
  if (!resultUrl.value) return;
  const res = await fetch(resultUrl.value);
  const blob = await res.blob();
  await copyFileToClipboard(blob);
}
async function process() {
  if (!file.value) return;
  processing.value = true;
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(horizontal.value ? -1 : 1, vertical.value ? -1 : 1);
    ctx.drawImage(img, horizontal.value ? -img.width : 0, vertical.value ? -img.height : 0);
    resultUrl.value = canvas.toDataURL(file.value!.type || 'image/png');
    URL.revokeObjectURL(objectUrl);
    processing.value = false;
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
          <img v-if="resultUrl" :src="resultUrl" class="tool-file-panel__output-image" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultUrl" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!resultUrl" @click="download">{{ t('tool.download') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NSpace>
              <NSwitch v-model:value="horizontal">{{ t('tools.imageFlip.horizontal') }}</NSwitch>
              <NSwitch v-model:value="vertical">{{ t('tools.imageFlip.vertical') }}</NSwitch>
            </NSpace>
            <NButton type="primary" :loading="processing" @click="process" :disabled="!file" block>
              {{ t('tools.imageFlip.flip') }}
            </NButton>
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>

<style scoped>
.tool-file-panel__output-image {
  max-width: 100%;
  max-height: 300px;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
}
</style>
