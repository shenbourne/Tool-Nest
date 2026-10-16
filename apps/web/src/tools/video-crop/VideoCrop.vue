<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NAlert, NInputNumber, NProgress } from 'naive-ui';
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
const width = ref(640);
const height = ref(480);
const x = ref(0);
const y = ref(0);
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);
const resultFile = ref<File | null>(null);

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
  resultFile.value = null;

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
    resultFile.value = new File([result], 'cropped.mp4', { type: 'video/mp4' });
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
          <NButton v-if="!isLoaded" :loading="isLoading" @click="load">
            {{ t('tool.loadFfmpeg') }}
          </NButton>
          <NProgress v-if="isLoading" type="line" :percentage="Math.round(loadProgress * 100)" />
          <NAlert v-if="loadError" type="error" :title="loadError" />
          <ToolFileUpload ref="fileUpload" accept="video/*" @change="onFileChange" />
        </template>
        <template #output-files>
          <FileCard v-if="resultFile" name="cropped.mp4" :file="resultFile" file-type="video/mp4" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultData" @click="resultData && downloadBlob(resultData, 'cropped.mp4', 'video/mp4')">
            {{ t('tool.download') }}
          </NButton>
          <NButton :disabled="!resultData" @click="copy">
            {{ t('tool.copyFile') }}
          </NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NSpace>
              <NInputNumber
                v-model:value="width"
                :min="1"
                :placeholder="t('common.width')"
                style="width: 120px"
                :input-props="{ id: 'videoCropField0' }"
              />
              <NInputNumber
                v-model:value="height"
                :min="1"
                :placeholder="t('common.height')"
                style="width: 120px"
                :input-props="{ id: 'videoCropField1' }"
              />
              <NInputNumber
                v-model:value="x"
                :min="0"
                placeholder="X"
                style="width: 120px"
                :input-props="{ id: 'videoCropField2' }"
              />
              <NInputNumber
                v-model:value="y"
                :min="0"
                placeholder="Y"
                style="width: 120px"
                :input-props="{ id: 'videoCropField3' }"
              />
            </NSpace>
            <NButton
              type="primary"
              :loading="processing"
              :disabled="!file || !isLoaded"
              @click="process"
              block
            >
              {{ t('common.crop') }}
            </NButton>
            <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
            <NAlert v-if="error" type="error" :title="error" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
