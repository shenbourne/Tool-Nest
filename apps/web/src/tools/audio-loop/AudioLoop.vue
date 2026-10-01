<script setup lang="ts">
import { NSpace, NButton, NAlert, NInputNumber, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import FileCard from '@/components/FileCard.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress, loadError } = useFFmpeg();
const { copyFileToClipboard } = useCopy();

const file = ref<File | null>(null);
const loopCount = ref(3);
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);
const resultFile = ref<File | null>(null);

function onFileChange(files: File[]) {
  file.value = files[0] ?? null;
  resultData.value = null;
  resultFile.value = null;
  error.value = '';
}

function downloadBlob(data: Uint8Array, filename: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function process() {
  if (!file.value || !isLoaded.value) return;
  processing.value = true;
  error.value = '';
  resultData.value = null;

  try {
    const inputBytes = new Uint8Array(await file.value.arrayBuffer());
    const loops = Math.max(1, loopCount.value);

    const result = await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
      const inputName = tempFile('.input');
      const outputName = tempFile('.mp3');
      await ffmpeg.writeFile(inputName, inputBytes);
      await ffmpeg.exec([
        '-stream_loop', `${loops - 1}`,
        '-i', inputName,
        '-c', 'copy',
        outputName,
      ]);
      return (await ffmpeg.readFile(outputName)) as Uint8Array;
    });

    resultData.value = result;
    const baseName = file.value.name.replace(/\.[^.]+$/, '');
    resultFile.value = new File([result], `${baseName}_loop${loops}x.mp3`, { type: 'audio/mpeg' });
    downloadBlob(result, `${baseName}_loop${loops}x.mp3`, 'audio/mpeg');
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('common.processingFailed');
  } finally {
    processing.value = false;
  }
}

async function copy() {
  if (!resultData.value) return;
  const blob = new Blob([resultData.value], { type: 'audio/mpeg' });
  await copyFileToClipboard(blob);
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <NButton v-if="!isLoaded" :loading="isLoading" @click="load">
            {{ t('tool.loadFfmpeg') }}
          </NButton>
          <NProgress v-if="isLoading" type="line" :percentage="Math.round(loadProgress * 100)" />
          <NAlert v-if="loadError" type="error" :title="loadError" />
          <ToolFileUpload ref="fileUpload" accept="audio/*" compact @change="onFileChange" />
        </template>
        <template #output-files>
          <FileCard v-if="resultFile" :name="resultFile.name" :file="resultFile" file-type="audio/mpeg" />
        </template>
        
        
        <template #actions-right>
          <NButton :disabled="!resultData" @click="copy">
            {{ t('tool.copyFile') }}
          </NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NInputNumber
              v-model:value="loopCount"
              :min="1"
              :placeholder="t('tools.audioLoop.loopCount')"
              style="width: 180px"
              :input-props="{ id: 'audioLoopField0' }"
            />
            <NButton
              type="primary"
              :loading="processing"
              :disabled="!file || !isLoaded"
              @click="process"
              block
            >
              {{ t('tools.audioLoop.loopAudio') }}
            </NButton>
            <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
            <NAlert v-if="error" type="error" :title="error" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
