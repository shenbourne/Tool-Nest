<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NSelect, NProgress } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { tool } from './index';

const { isLoaded, isLoading, load, loadProgress } = useFFmpeg();

const file = ref<File | null>(null);
const direction = ref<string>('horizontal');
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);
const resultUrl = ref('');

const directionOptions = [
  { label: 'Horizontal', value: 'horizontal' },
  { label: 'Vertical', value: 'vertical' },
];

const flipFilter = computed(() => {
  return direction.value === 'horizontal' ? 'hflip' : 'vflip';
});

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  file.value = input.files?.[0] ?? null;
  resultData.value = null;
  resultUrl.value = '';
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
  resultUrl.value = '';

  try {
    const inputBytes = new Uint8Array(await file.value.arrayBuffer());

    const result = await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
      const inputName = tempFile('.mp4');
      const outputName = tempFile('.mp4');
      await ffmpeg.writeFile(inputName, inputBytes);
      await ffmpeg.exec([
        '-i', inputName,
        '-vf', flipFilter.value,
        outputName,
      ]);
      return (await ffmpeg.readFile(outputName)) as Uint8Array;
    });

    resultData.value = result;
    const blob = new Blob([result], { type: 'video/mp4' });
    resultUrl.value = URL.createObjectURL(blob);
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

        <input type="file" accept="video/*" @change="onFileChange" />

        <NSelect
          v-model:value="direction"
          :options="directionOptions"
          style="width: 200px"
          placeholder="Select direction"
        />

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!file || !isLoaded"
          @click="process"
        >
          Flip
        </NButton>

        <NAlert v-if="processing" type="info" title="Processing..." />
        <NAlert v-if="error" type="error" :title="error" />

        <NButton v-if="resultData" @click="downloadBlob(resultData, 'flipped.mp4', 'video/mp4')">
          Download
        </NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
