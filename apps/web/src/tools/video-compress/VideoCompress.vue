<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NSelect, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { tool } from './index';

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress } = useFFmpeg();

const file = ref<File | null>(null);
const quality = ref<string>('medium');
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);
const resultUrl = ref('');

const qualityOptions = [
  { label: 'Low (smaller file)', value: 'low' },
  { label: 'Medium (balanced)', value: 'medium' },
  { label: 'High (better quality)', value: 'high' },
];

const crfMap: Record<string, string> = { low: '28', medium: '23', high: '18' };
const crf = computed(() => crfMap[quality.value] ?? '23');

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
        '-crf', crf.value,
        '-preset', 'fast',
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
          v-model:value="quality"
          :options="qualityOptions"
          style="width: 240px"
          placeholder="Select quality"
        />

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!file || !isLoaded"
          @click="process"
        >
          Compress
        </NButton>

        <NAlert v-if="processing" type="info" title="Processing..." />
        <NAlert v-if="error" type="error" :title="error" />

        <NButton v-if="resultData" @click="downloadBlob(resultData, 'compressed.mp4', 'video/mp4')">
          Download
        </NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
