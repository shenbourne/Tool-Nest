<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NInputNumber, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress, loadError } = useFFmpeg();
const { copyFileToClipboard } = useCopy();

const file = ref<File | null>(null);
const fps = ref(10);
const width = ref(480);
const duration = ref<number | null>(null);
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
      const outputName = tempFile('.gif');
      await ffmpeg.writeFile(inputName, inputBytes);

      const args: string[] = ['-i', inputName];
      if (duration.value && duration.value > 0) {
        args.push('-t', String(duration.value));
      }
      args.push(
        '-vf', `fps=${fps.value},scale=${width.value}:-1:flags=lanczos`,
        '-loop', '0',
        outputName,
      );

      await ffmpeg.exec(args);
      return (await ffmpeg.readFile(outputName)) as Uint8Array;
    });

    resultData.value = result;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('common.processingFailed');
  } finally {
    processing.value = false;
  }
}

async function copy() {
  if (!resultData.value) return;
  const blob = new Blob([resultData.value], { type: 'image/gif' });
  await copyFileToClipboard(blob);
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
          <NInputNumber v-model:value="fps" :min="1" :max="30" placeholder="FPS" style="width: 120px"  :input-props="{ id: 'videoToGifField0' }"/>
          <NInputNumber v-model:value="width" :min="64" :max="1920" :placeholder="t('common.width')" style="width: 120px"  :input-props="{ id: 'videoToGifField1' }"/>
          <NInputNumber v-model:value="duration" :min="0" :max="999" :placeholder="t('tools.videoToGif.duration')" style="width: 160px"  :input-props="{ id: 'videoToGifField2' }"/>
        </NSpace>

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!file || !isLoaded"
          @click="process"
        >
          {{ t('tools.videoToGif.convertToGif') }}
        </NButton>

        <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
        <NAlert v-if="error" type="error" :title="error" />

        <NButton v-if="resultData" @click="downloadBlob(resultData, 'output.gif', 'image/gif')">
          {{ t('tool.downloadGif') }}
        </NButton>
        <NButton v-if="resultData" :disabled="!resultData" @click="copy">
          {{ t('tool.copyFile') }}
        </NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
