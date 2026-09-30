<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NSelect, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { useCopy } from '@/composables/useCopy';
import { gifSpeedFilter } from '@/utils/ffmpeg-speed';
import { tool } from './index';

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress, loadError } = useFFmpeg();
const { copyFileToClipboard } = useCopy();

const file = ref<File | null>(null);
const speed = ref<string>('1');
const processing = ref(false);
const taskProgress = ref(0);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);

const speedOptions = computed(() => [
  { label: t('tools.gifChangeSpeed.speedVerySlow'), value: '0.25' },
  { label: t('tools.gifChangeSpeed.speedSlow'), value: '0.5' },
  { label: t('tools.gifChangeSpeed.speedNormal'), value: '1' },
  { label: t('tools.gifChangeSpeed.speedFast'), value: '1.5' },
  { label: t('tools.gifChangeSpeed.speedFaster'), value: '2' },
  { label: t('tools.gifChangeSpeed.speedVeryFast'), value: '4' },
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
  taskProgress.value = 0;
  error.value = '';
  resultData.value = null;

  try {
    const inputBytes = new Uint8Array(await file.value.arrayBuffer());
    const factor = parseFloat(speed.value);

    const result = await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
      const inputName = tempFile('.gif');
      const outputName = tempFile('.gif');
      await ffmpeg.writeFile(inputName, inputBytes);
      await ffmpeg.exec([
        '-i', inputName,
        '-filter_complex', gifSpeedFilter(factor),
        '-map', '[v]',
        outputName,
      ]);
      return (await ffmpeg.readFile(outputName)) as Uint8Array;
    }, (p) => { taskProgress.value = p; });

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

        <ToolFileUpload accept="image/gif" @change="onFileChange" />

        <NSelect
          v-model:value="speed"
          :options="speedOptions"
          style="width: 240px"
          :placeholder="t('tools.gifChangeSpeed.selectSpeed')"
        />

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!file || !isLoaded"
          @click="process"
        >
          {{ t('tools.gifChangeSpeed.changeSpeed') }}
        </NButton>

        <NProgress v-if="processing" type="line" :percentage="Math.round(taskProgress * 100)" indicator-placement="inside" />
        <NAlert v-if="error" type="error" :title="error" />

        <NButton v-if="resultData" @click="downloadBlob(resultData, 'respeed.gif', 'image/gif')">
          {{ t('tool.downloadGif') }}
        </NButton>
        <NButton v-if="resultData" :disabled="!resultData" @click="copy">
          {{ t('tool.copyFile') }}
        </NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
