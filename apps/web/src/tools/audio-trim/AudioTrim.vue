<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NInputNumber, NProgress } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { tool } from './index';

const { isLoaded, isLoading, load, loadProgress } = useFFmpeg();

const file = ref<File | null>(null);
const startTime = ref(0);
const endTime = ref(10);
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  file.value = input.files?.[0] ?? null;
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
  if (!file.value || !isLoaded.value) return;
  processing.value = true;
  error.value = '';
  resultData.value = null;

  try {
    const inputBytes = new Uint8Array(await file.value.arrayBuffer());

    const result = await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
      const inputName = tempFile('.input');
      const outputName = tempFile('.mp3');
      await ffmpeg.writeFile(inputName, inputBytes);
      await ffmpeg.exec([
        '-i', inputName,
        '-ss', `${startTime.value}`,
        '-to', `${endTime.value}`,
        '-c', 'copy',
        outputName,
      ]);
      return (await ffmpeg.readFile(outputName)) as Uint8Array;
    });

    resultData.value = result;
    const baseName = file.value.name.replace(/\.[^.]+$/, '');
    downloadBlob(result, `${baseName}_trimmed.mp3`, 'audio/mpeg');
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Processing failed';
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
          Load FFmpeg
        </NButton>
        <NProgress v-if="isLoading" type="line" :percentage="Math.round(loadProgress * 100)" />

        <input type="file" accept="audio/*" @change="onFileChange" />

        <NSpace>
          <NInputNumber
            v-model:value="startTime"
            :min="0"
            placeholder="Start (seconds)"
            style="width: 180px"
          />
          <NInputNumber
            v-model:value="endTime"
            :min="0"
            placeholder="End (seconds)"
            style="width: 180px"
          />
        </NSpace>

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!file || !isLoaded"
          @click="process"
        >
          Trim Audio
        </NButton>

        <NAlert v-if="processing" type="info" title="Processing..." />
        <NAlert v-if="error" type="error" :title="error" />

        <NAlert v-if="resultData" type="success" title="Audio trimmed! File downloaded." />
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
