<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NInputNumber, NSwitch, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { tool } from './index';

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress } = useFFmpeg();

const file = ref<File | null>(null);
const width = ref(1280);
const height = ref(720);
const keepAspectRatio = ref(true);
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);

const scaleFilter = computed(() => {
  if (keepAspectRatio.value) {
    return `scale=${width.value}:-1`;
  }
  return `scale=${width.value}:${height.value}`;
});

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
        '-vf', scaleFilter.value,
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

        <NSpace align="center">
          <NInputNumber
            v-model:value="width"
            :min="1"
            :placeholder="t('common.width')"
            style="width: 140px"
          />
          <NInputNumber
            v-model:value="height"
            :min="1"
            :disabled="keepAspectRatio"
            :placeholder="t('common.height')"
            style="width: 140px"
          />
          <NSwitch v-model:value="keepAspectRatio" />
          <span>{{ t('tools.videoResize.keepAspectRatio') }}</span>
        </NSpace>

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!file || !isLoaded"
          @click="process"
        >
          {{ t('common.resize') }}
        </NButton>

        <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
        <NAlert v-if="error" type="error" :title="error" />

        <NButton v-if="resultData" @click="downloadBlob(resultData, 'resized.mp4', 'video/mp4')">
          {{ t('tool.download') }}
        </NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
