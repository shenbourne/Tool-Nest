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
  { label: t('tools.videoChangeSpeed.speedVerySlow'), value: '0.25' },
  { label: t('tools.videoChangeSpeed.speedSlow'), value: '0.5' },
  { label: t('tools.videoChangeSpeed.speedNormal'), value: '1' },
  { label: t('tools.videoChangeSpeed.speedFast'), value: '1.5' },
  { label: t('tools.videoChangeSpeed.speedFaster'), value: '2' },
  { label: t('tools.videoChangeSpeed.speedVeryFast'), value: '4' },
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
    const factor = parseFloat(speed.value);
    // ffmpeg's atempo only accepts [0.5, 100]; slower factors need a chain of
    // filters (0.25 = atempo=0.5,atempo=0.5).
    const atempo = atempoChain(1 / factor);

    const result = await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
      const inputName = tempFile('.mp4');
      const outputName = tempFile('.mp4');
      await ffmpeg.writeFile(inputName, inputBytes);
      let code = await ffmpeg.exec([
        '-i', inputName,
        '-filter:v', `setpts=${factor}*PTS`,
        '-filter:a', atempo,
        outputName,
      ]);
      if (code !== 0) {
        // Videos without an audio stream reject -filter:a; retry video-only.
        code = await ffmpeg.exec([
          '-i', inputName,
          '-filter:v', `setpts=${factor}*PTS`,
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

function atempoChain(value: number): string {
  const parts: string[] = [];
  let v = value;
  while (v < 0.5) { parts.push('atempo=0.5'); v /= 0.5; }
  while (v > 100) { parts.push('atempo=100'); v /= 100; }
  parts.push(`atempo=${Math.round(v * 100) / 100}`);
  return parts.join(',');
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

        <input type="file" accept="video/*" @change="onFileChange" />

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
