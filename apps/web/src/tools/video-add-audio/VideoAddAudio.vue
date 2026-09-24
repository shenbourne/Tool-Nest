<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { tool } from './index';

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress } = useFFmpeg();

const videoFile = ref<File | null>(null);
const audioFile = ref<File | null>(null);
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);

function onVideoChange(event: Event) {
  const input = event.target as HTMLInputElement;
  videoFile.value = input.files?.[0] ?? null;
  resultData.value = null;
  error.value = '';
}

function onAudioChange(event: Event) {
  const input = event.target as HTMLInputElement;
  audioFile.value = input.files?.[0] ?? null;
  resultData.value = null;
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
  error.value = '';
  resultData.value = null;

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
    });

    resultData.value = result;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('common.processingFailed');
  } finally {
    processing.value = false;
  }
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="12">
        <NButton v-if="!isLoaded" :loading="isLoading" @click="load">
          {{ t('tool.loadFfmpeg') }}
        </NButton>
        <NProgress v-if="isLoading" type="line" :percentage="Math.round(loadProgress * 100)" />

        <div>
          <label>{{ t('tools.videoAddAudio.videoFile') }}: </label>
          <input type="file" accept="video/*" @change="onVideoChange" />
        </div>

        <div>
          <label>{{ t('tools.videoAddAudio.audioFile') }}: </label>
          <input type="file" accept="audio/*" @change="onAudioChange" />
        </div>

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!videoFile || !audioFile || !isLoaded"
          @click="process"
        >
          {{ t('tools.videoAddAudio.addAudio') }}
        </NButton>

        <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
        <NAlert v-if="error" type="error" :title="error" />

        <NButton v-if="resultData" @click="downloadBlob(resultData, 'with-audio.mp4', 'video/mp4')">
          {{ t('tool.download') }}
        </NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
