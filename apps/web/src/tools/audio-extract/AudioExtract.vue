<script setup lang="ts">
import { NSpace, NButton, NAlert, NSelect, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import FileCard from '@/components/FileCard.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress, loadError } = useFFmpeg();
const { copyFileToClipboard } = useCopy();

const file = ref<File | null>(null);
const outputFormat = ref<string>('mp3');
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);
const resultFile = ref<File | null>(null);

const formatOptions = [
  { label: 'MP3', value: 'mp3' },
  { label: 'WAV', value: 'wav' },
  { label: 'OGG', value: 'ogg' },
];

const codecMap: Record<string, string> = {
  mp3: 'libmp3lame',
  wav: 'pcm_s16le',
  ogg: 'libvorbis',
};

const mimeMap: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
};

function onFileChange(files: File[]) {
  file.value = files[0] ?? null;
  resultData.value = null;
  resultFile.value = null;
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
    const ext = `.${outputFormat.value}`;
    const codec = codecMap[outputFormat.value] ?? 'libmp3lame';
    const mime = mimeMap[outputFormat.value] ?? 'audio/mpeg';

    const result = await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
      const inputName = tempFile('.video');
      const outputName = tempFile(ext);
      await ffmpeg.writeFile(inputName, inputBytes);
      await ffmpeg.exec([
        '-i', inputName,
        '-vn',
        '-codec:a', codec,
        outputName,
      ]);
      return (await ffmpeg.readFile(outputName)) as Uint8Array;
    });

    resultData.value = result;
    const baseName = file.value.name.replace(/\.[^.]+$/, '');
    resultFile.value = new File([result], `${baseName}_audio${ext}`, { type: mime });
    downloadBlob(result, `${baseName}_audio${ext}`, mime);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('common.processingFailed');
  } finally {
    processing.value = false;
  }
}

async function copy() {
  if (!resultData.value) return;
  const mime = mimeMap[outputFormat.value] ?? 'audio/mpeg';
  const blob = new Blob([resultData.value], { type: mime });
  await copyFileToClipboard(blob);
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <NButton v-if="!isLoaded" :loading="isLoading" @click="load">
            {{ t('tool.loadFfmpeg') }}
          </NButton>
          <NProgress v-if="isLoading" type="line" :percentage="Math.round(loadProgress * 100)" />
          <NAlert v-if="loadError" type="error" :title="loadError" />
          <ToolFileUpload ref="fileUpload" accept="video/*" compact @change="onFileChange" />
        </template>
        <template #output-files>
          <FileCard v-if="resultFile" :name="resultFile.name" :file="resultFile" :file-type="resultFile.type" />
        </template>
        
        
        <template #actions-right>
          <NButton :disabled="!resultData" @click="copy">
            {{ t('tool.copyFile') }}
          </NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NSelect
              v-model:value="outputFormat"
              :options="formatOptions"
              style="width: 200px"
              :placeholder="t('tools.audioExtract.selectOutputFormat')"
            />
            <NButton
              type="primary"
              :loading="processing"
              :disabled="!file || !isLoaded"
              @click="process"
              block
            >
              {{ t('tools.audioExtract.extractAudio') }}
            </NButton>
            <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
            <NAlert v-if="error" type="error" :title="error" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
