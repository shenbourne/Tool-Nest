<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NSelect, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { tool } from './index';

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress } = useFFmpeg();

const file = ref<File | null>(null);
const speed = ref<string>('1');
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);

const speedOptions = computed(() => [
  { label: t('tools.audioChangeSpeed.speedHalf'), value: '0.5' },
  { label: '0.75x', value: '0.75' },
  { label: t('tools.audioChangeSpeed.speedNormal'), value: '1' },
  { label: '1.25x', value: '1.25' },
  { label: '1.5x', value: '1.5' },
  { label: t('tools.audioChangeSpeed.speedDouble'), value: '2' },
]);

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
    const factor = speed.value;

    const result = await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
      const inputName = tempFile('.input');
      const outputName = tempFile('.mp3');
      await ffmpeg.writeFile(inputName, inputBytes);
      await ffmpeg.exec([
        '-i', inputName,
        '-filter:a', `atempo=${factor}`,
        outputName,
      ]);
      return (await ffmpeg.readFile(outputName)) as Uint8Array;
    });

    resultData.value = result;
    const baseName = file.value.name.replace(/\.[^.]+$/, '');
    downloadBlob(result, `${baseName}_${factor}x.mp3`, 'audio/mpeg');
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
          v-model:value="speed"
          :options="speedOptions"
          style="width: 240px"
          :placeholder="t('tools.audioChangeSpeed.selectSpeed')"
        />

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!file || !isLoaded"
          @click="process"
        >
          {{ t('tools.audioChangeSpeed.changeSpeed') }}
        </NButton>

        <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
        <NAlert v-if="error" type="error" :title="error" />

        <NAlert v-if="resultData" type="success" :title="t('tools.audioChangeSpeed.speedChanged')" />
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
