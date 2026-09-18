<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NSelect, NProgress } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { tool } from './index';

const { isLoaded, isLoading, load, loadProgress } = useFFmpeg();

const file = ref<File | null>(null);
const speed = ref<string>('1');
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);

const speedOptions = [
  { label: '0.25x (very fast)', value: '0.25' },
  { label: '0.5x (faster)', value: '0.5' },
  { label: '1x (normal)', value: '1' },
  { label: '1.5x (slower)', value: '1.5' },
  { label: '2x (slow)', value: '2' },
  { label: '4x (very slow)', value: '4' },
];

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
    const factor = parseFloat(speed.value);

    const result = await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
      const inputName = tempFile('.gif');
      const outputName = tempFile('.gif');
      await ffmpeg.writeFile(inputName, inputBytes);
      await ffmpeg.exec([
        '-i', inputName,
        '-filter_complex', `[0:v]setpts=${factor}*PTS,fps=10[v]`,
        '-map', '[v]',
        outputName,
      ]);
      return (await ffmpeg.readFile(outputName)) as Uint8Array;
    });

    resultData.value = result;
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

        <input type="file" accept="image/gif" @change="onFileChange" />

        <NSelect
          v-model:value="speed"
          :options="speedOptions"
          style="width: 240px"
          placeholder="Select speed"
        />

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!file || !isLoaded"
          @click="process"
        >
          Change Speed
        </NButton>

        <NAlert v-if="processing" type="info" title="Processing..." />
        <NAlert v-if="error" type="error" :title="error" />

        <NButton v-if="resultData" @click="downloadBlob(resultData, 'respeed.gif', 'image/gif')">
          Download GIF
        </NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
