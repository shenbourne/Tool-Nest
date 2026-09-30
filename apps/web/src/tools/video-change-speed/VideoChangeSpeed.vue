<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NSelect, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { audioAtempoFilter, videoSetptsFilter } from '@/utils/ffmpeg-speed';
import { tool } from './index';

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress, loadError } = useFFmpeg();

const file = ref<File | null>(null);
const speed = ref<string>('1');
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);

const speedOptions = computed(() => [
  { label: t('tools.videoChangeSpeed.speedVerySlow'), value: '0.25' },
  { label: t('tools.videoChangeSpeed.speedSlow'), value: '0.5' },
  { label: t('tools.videoChangeSpeed.speedNormal'), value: '1' },
  { label: t('tools.videoChangeSpeed.speedFast'), value: '1.5' },
  { label: t('tools.videoChangeSpeed.speedFaster'), value: '2' },
  { label: t('tools.videoChangeSpeed.speedVeryFast'), value: '4' },
]);

function onFileChange(files: File[]) {
  file.value = files[0] ?? null;
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
      const inputName = tempFile('.mp4');
      const outputName = tempFile('.mp4');
      await ffmpeg.writeFile(inputName, inputBytes);
      let code = await ffmpeg.exec([
        '-i', inputName,
        '-filter:v', videoSetptsFilter(factor),
        '-filter:a', audioAtempoFilter(factor),
        outputName,
      ]);
      if (code !== 0) {
        // Videos without an audio stream reject -filter:a; retry video-only.
        code = await ffmpeg.exec([
          '-i', inputName,
          '-filter:v', videoSetptsFilter(factor),
          outputName,
        ]);
      }
      if (code !== 0) throw new Error(t('common.processingFailed'));
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
        <NAlert v-if="loadError" type="error" :title="loadError" />

        <ToolFileUpload accept="video/*" @change="onFileChange" />

        <NSelect
          v-model:value="speed"
          :options="speedOptions"
          style="width: 240px"
          :placeholder="t('tools.videoChangeSpeed.selectSpeed')"
        />

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!file || !isLoaded"
          @click="process"
        >
          {{ t('tools.videoChangeSpeed.changeSpeed') }}
        </NButton>

        <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
        <NAlert v-if="error" type="error" :title="error" />

        <NButton v-if="resultData" @click="downloadBlob(resultData, 'speed-changed.mp4', 'video/mp4')">
          {{ t('tool.download') }}
        </NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
