<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NAlert, NProgress } from 'naive-ui';
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

const videoFile = ref<File | null>(null);
const audioFile = ref<File | null>(null);
const processing = ref(false);
const taskProgress = ref(0);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);
const resultFile = ref<File | null>(null);

function onVideoChange(files: File[]) {
  videoFile.value = files[0] ?? null;
  resultData.value = null;
  resultFile.value = null;
  error.value = '';
}

function onAudioChange(files: File[]) {
  audioFile.value = files[0] ?? null;
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
  if (!videoFile.value || !audioFile.value || !isLoaded.value) return;
  processing.value = true;
  taskProgress.value = 0;
  error.value = '';
  resultData.value = null;
  resultFile.value = null;

  try {
    const videoBytes = new Uint8Array(await videoFile.value.arrayBuffer());
    const audioBytes = new Uint8Array(await audioFile.value.arrayBuffer());

    const result = await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
      const videoName = tempFile('.mp4');
      const audioName = tempFile('.mp3');
      const outputName = tempFile('.mp4');
      await ffmpeg.writeFile(videoName, videoBytes);
      await ffmpeg.writeFile(audioName, audioBytes);
      await ffmpeg.exec([
        '-i', videoName,
        '-i', audioName,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-shortest',
        '-map', '0:v:0',
        '-map', '1:a:0',
        outputName,
      ]);
      return (await ffmpeg.readFile(outputName)) as Uint8Array;
    }, (p) => { taskProgress.value = p; });

    resultData.value = result;
    resultFile.value = new File([result], 'with-audio.mp4', { type: 'video/mp4' });
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('common.processingFailed');
  } finally {
    processing.value = false;
  }
}

async function copy() {
  if (!resultData.value) return;
  const blob = new Blob([resultData.value], { type: 'video/mp4' });
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
          <div>
            <span>{{ t('tools.videoAddAudio.videoFile') }}</span>
            <ToolFileUpload ref="fileUpload" accept="video/*" @change="onVideoChange" />
          </div>
          <div style="margin-top: 8px;">
            <span>{{ t('tools.videoAddAudio.audioFile') }}</span>
            <ToolFileUpload accept="audio/*" @change="onAudioChange" />
          </div>
        </template>
        <template #output-files>
          <FileCard v-if="resultFile" name="with-audio.mp4" :file="resultFile" file-type="video/mp4" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultData" @click="resultData && downloadBlob(resultData, 'with-audio.mp4', 'video/mp4')">
            {{ t('tool.download') }}
          </NButton>
          <NButton :disabled="!resultData" @click="copy">
            {{ t('tool.copyFile') }}
          </NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NButton
              type="primary"
              :loading="processing"
              :disabled="!videoFile || !audioFile || !isLoaded"
              @click="process"
              block
            >
              {{ t('tools.videoAddAudio.addAudio') }}
            </NButton>
            <NProgress v-if="processing" type="line" :percentage="Math.round(taskProgress * 100)" indicator-placement="inside" />
            <NAlert v-if="error" type="error" :title="error" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
