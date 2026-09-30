<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NInputNumber, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { tool } from './index';

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress, loadError } = useFFmpeg();

const file = ref<File | null>(null);
const startTime = ref(0);
const endTime = ref(10);
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);

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

    const result = await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
      const inputName = tempFile('.mp4');
      const outputName = tempFile('.mp4');
      await ffmpeg.writeFile(inputName, inputBytes);
      await ffmpeg.exec([
        '-i', inputName,
        '-ss', String(startTime.value),
        '-to', String(endTime.value),
        '-c', 'copy',
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
        <NAlert v-if="loadError" type="error" :title="loadError" />

        <ToolFileUpload accept="video/*" @change="onFileChange" />

        <NSpace>
          <NInputNumber
            v-model:value="startTime"
            :min="0"
            :placeholder="t('tools.videoTrim.startTime')"
            style="width: 140px"
           :input-props="{ id: 'videoTrimField0' }"/>
          <NInputNumber
            v-model:value="endTime"
            :min="0"
            :placeholder="t('tools.videoTrim.endTime')"
            style="width: 140px"
           :input-props="{ id: 'videoTrimField1' }"/>
        </NSpace>

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!file || !isLoaded"
          @click="process"
        >
          {{ t('common.trim') }}
        </NButton>

        <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
        <NAlert v-if="error" type="error" :title="error" />

        <NButton v-if="resultData" @click="downloadBlob(resultData, 'trimmed.mp4', 'video/mp4')">
          {{ t('tool.download') }}
        </NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
