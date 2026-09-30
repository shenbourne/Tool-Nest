<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NProgress, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress, loadError } = useFFmpeg();
const { copyFileToClipboard } = useCopy();

const files = ref<File[]>([]);
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);

function onFileChange(selected: File[]) {
  files.value = selected;
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
  if (files.value.length < 2 || !isLoaded.value) return;
  processing.value = true;
  error.value = '';
  resultData.value = null;

  try {
    const fileBytes: { name: string; data: Uint8Array }[] = [];
    for (const f of files.value) {
      fileBytes.push({
        name: f.name,
        data: new Uint8Array(await f.arrayBuffer()),
      });
    }

    const result = await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
      const inputNames: string[] = [];
      for (const fb of fileBytes) {
        const inputName = tempFile('.mp3');
        await ffmpeg.writeFile(inputName, fb.data);
        inputNames.push(inputName);
      }

      const listContent = inputNames.map((n) => `file '${n}'`).join('\n');
      const listName = tempFile('.txt');
      await ffmpeg.writeFile(listName, listContent);

      const outputName = tempFile('.mp3');
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', listName,
        '-c', 'copy',
        outputName,
      ]);
      return (await ffmpeg.readFile(outputName)) as Uint8Array;
    });

    resultData.value = result;
    downloadBlob(result, 'merged_audio.mp3', 'audio/mpeg');
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('common.processingFailed');
  } finally {
    processing.value = false;
  }
}

async function copy() {
  if (!resultData.value) return;
  const blob = new Blob([resultData.value], { type: 'audio/mpeg' });
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
          <ToolFileUpload ref="fileUpload" accept="audio/*" multiple compact @change="onFileChange" />
          <NSpace v-if="files.length > 0" style="margin-top: 8px;">
            <NTag v-for="(f, i) in files" :key="i" size="small" closable @close="files.splice(i, 1)">
              {{ f.name }}
            </NTag>
          </NSpace>
        </template>
        <template #output-files>
          <NAlert v-if="resultData" type="success" :title="t('tools.audioMerge.audioMerged')" />
        </template>
        
        
        <template #actions-right>
          <NButton :disabled="!resultData" @click="copy">
            {{ t('tool.copyFile') }}
          </NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NButton
              type="primary"
              :loading="processing"
              :disabled="files.length < 2 || !isLoaded"
              @click="process"
              block
            >
              {{ t('tools.audioMerge.mergeAudio') }}
            </NButton>
            <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
            <NAlert v-if="error" type="error" :title="error" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
