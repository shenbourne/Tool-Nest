<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NInputNumber, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { tool } from './index';

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress } = useFFmpeg();

const file = ref<File | null>(null);
const width = ref(640);
const height = ref(480);
const x = ref(0);
const y = ref(0);
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
      const inputName = tempFile('.mp4');
      const outputName = tempFile('.mp4');
      await ffmpeg.writeFile(inputName, inputBytes);
      await ffmpeg.exec([
        '-i', inputName,
        '-vf', `crop=${width.value}:${height.value}:${x.value}:${y.value}`,
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

        <input type="file" accept="video/*" @change="onFileChange" />

        <NSpace>
          <NInputNumber
            v-model:value="width"
            :min="1"
            :placeholder="t('common.width')"
            style="width: 120px"
          />
          <NInputNumber
            v-model:value="height"
            :min="1"
            :placeholder="t('common.height')"
            style="width: 120px"
          />
          <NInputNumber
            v-model:value="x"
            :min="0"
            placeholder="X"
            style="width: 120px"
          />
          <NInputNumber
            v-model:value="y"
            :min="0"
            placeholder="Y"
            style="width: 120px"
          />
        </NSpace>

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!file || !isLoaded"
          @click="process"
        >
          {{ t('common.crop') }}
        </NButton>

        <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
        <NAlert v-if="error" type="error" :title="error" />

        <NButton v-if="resultData" @click="downloadBlob(resultData, 'cropped.mp4', 'video/mp4')">
          {{ t('tool.download') }}
        </NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
