<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NSelect, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { tool } from './index';

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress } = useFFmpeg();

const file = ref<File | null>(null);
const rotation = ref<string>('90cw');
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);
const resultUrl = ref('');

const rotationOptions = computed(() => [
  { label: t('tools.videoRotate.rotation90cw'), value: '90cw' },
  { label: t('tools.videoRotate.rotation90ccw'), value: '90ccw' },
  { label: t('tools.videoRotate.rotation180'), value: '180' },
]);

const transposeFilter = computed(() => {
  switch (rotation.value) {
    case '90cw': return 'transpose=1';
    case '90ccw': return 'transpose=2';
    case '180': return 'transpose=1,transpose=1';
    default: return 'transpose=1';
  }
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
        '-vf', transposeFilter.value,
        outputName,
      ]);
      return (await ffmpeg.readFile(outputName)) as Uint8Array;
    });

    resultData.value = result;
    const blob = new Blob([result], { type: 'video/mp4' });
    resultUrl.value = URL.createObjectURL(blob);
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

        <input type="file" accept="video/*" @change="onFileChange" />

        <NSelect
          v-model:value="rotation"
          :options="rotationOptions"
          style="width: 260px"
          :placeholder="t('tools.videoRotate.selectRotation')"
        />

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!file || !isLoaded"
          @click="process"
        >
          {{ t('common.rotate') }}
        </NButton>

        <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
        <NAlert v-if="error" type="error" :title="error" />

        <NButton v-if="resultData" @click="downloadBlob(resultData, 'rotated.mp4', 'video/mp4')">
          {{ t('tool.download') }}
        </NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
