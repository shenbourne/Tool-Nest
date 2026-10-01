<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import FileCard from '@/components/FileCard.vue';
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
const resultFile = ref<File | null>(null);

function onFileChange(selected: File[]) {
  files.value = selected;
  resultData.value = null;
  resultFile.value = null;
  error.value = '';
}

function removeFile(index: number) {
  files.value.splice(index, 1);
}

function moveUp(index: number) {
  if (index <= 0) return;
  const arr = files.value;
  [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
  files.value = [...arr];
}

function moveDown(index: number) {
  if (index >= files.value.length - 1) return;
  const arr = files.value;
  [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
  files.value = [...arr];
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
  resultFile.value = null;

  try {
    const fileBytes: Uint8Array[] = [];
    for (const f of files.value) {
      fileBytes.push(new Uint8Array(await f.arrayBuffer()));
    }

    const result = await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
      const inputNames: string[] = [];
      for (let i = 0; i < fileBytes.length; i++) {
        const inputName = tempFile('.mp4');
        await ffmpeg.writeFile(inputName, fileBytes[i]);
        inputNames.push(inputName);
      }

      const listContent = inputNames.map((name) => `file '${name}'`).join('\n');
      const listName = tempFile('.txt');
      await ffmpeg.writeFile(listName, new TextEncoder().encode(listContent));

      const outputName = tempFile('.mp4');
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
    resultFile.value = new File([result], 'merged.mp4', { type: 'video/mp4' });
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('common.processingFailed');
  } finally {
    processing.value = false;
  }
}

async function copy() {
  if (!resultData.value) return;
  const blob = new Blob([resultData.value], { type: 'video/mp4' });
  await copyFileToClipboard(blob);
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <NButton v-if="!isLoaded" :loading="isLoading" @click="load" size="small">
            {{ t('tool.loadFfmpeg') }}
          </NButton>
          <NProgress v-if="isLoading" type="line" :percentage="Math.round(loadProgress * 100)" style="width: 100%" />
          <NAlert v-if="loadError" type="error" :title="loadError" />
          <ToolFileUpload ref="fileUpload" accept="video/*" multiple compact @change="onFileChange" />
          <div v-if="files.length > 0" style="margin-top: 12px; width: 100%">
            <div v-for="(f, i) in files" :key="i" style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ f.name }}</span>
              <NButton size="tiny" @click="moveUp(i)" :disabled="i === 0">{{ t('common.moveUp') }}</NButton>
              <NButton size="tiny" @click="moveDown(i)" :disabled="i === files.length - 1">{{ t('common.moveDown') }}</NButton>
              <NButton size="tiny" type="error" @click="removeFile(i)">{{ t('common.remove') }}</NButton>
            </div>
          </div>
        </template>
        <template #output-files>
          <FileCard v-if="resultFile" name="merged.mp4" :file="resultFile" file-type="video/mp4" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultData" @click="resultData && downloadBlob(resultData, 'merged.mp4', 'video/mp4')">
            {{ t('tool.download') }}
          </NButton>
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
              {{ t('common.merge') }}
            </NButton>
            <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
            <NAlert v-if="error" type="error" :title="error" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
