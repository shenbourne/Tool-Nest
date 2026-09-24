<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NSelect, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { tool } from './index';

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress } = useFFmpeg();

const file = ref<File | null>(null);
const targetFormat = ref<string>('mp3');
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);

const formatOptions = [
  { label: 'MP3', value: 'mp3' },
  { label: 'WAV', value: 'wav' },
  { label: 'OGG', value: 'ogg' },
  { label: 'FLAC', value: 'flac' },
  { label: 'AAC', value: 'aac' },
];

const codecMap: Record<string, string> = {
  mp3: 'libmp3lame',
  wav: 'pcm_s16le',
  ogg: 'libvorbis',
  flac: 'flac',
  aac: 'aac',
};

const mimeMap: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  flac: 'audio/flac',
  aac: 'audio/aac',
};

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
    const ext = `.${targetFormat.value}`;
    const codec = codecMap[targetFormat.value] ?? 'libmp3lame';
    const mime = mimeMap[targetFormat.value] ?? 'audio/mpeg';

    const result = await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
      const inputName = tempFile('.input');
      const outputName = tempFile(ext);
      await ffmpeg.writeFile(inputName, inputBytes);
      await ffmpeg.exec([
        '-i', inputName,
        '-codec:a', codec,
        outputName,
      ]);
      return (await ffmpeg.readFile(outputName)) as Uint8Array;
    });

    resultData.value = result;
    const baseName = file.value.name.replace(/\.[^.]+$/, '');
    downloadBlob(result, `${baseName}${ext}`, mime);
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

        <input type="file" accept="audio/*" @change="onFileChange" />

        <NSelect
          v-model:value="targetFormat"
          :options="formatOptions"
          style="width: 200px"
          :placeholder="t('tools.audioConverter.selectFormat')"
        />

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!file || !isLoaded"
          @click="process"
        >
          {{ t('common.convert') }}
        </NButton>

        <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
        <NAlert v-if="error" type="error" :title="error" />

        <NAlert v-if="resultData" type="success" :title="t('tools.audioConverter.conversionComplete')" />
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
