<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NCard, NSpace, NButton, NAlert, NInputNumber, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import FileCard from '@/components/FileCard.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { useCopy } from '@/composables/useCopy';
import { buildImagesToGifCommand } from '@/utils/image-slideshow';
import { tool } from './index';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress, loadError } = useFFmpeg();
const { copyFileToClipboard } = useCopy();

const files = ref<File[]>([]);
const frameDuration = ref(0.5);
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);
const resultFile = ref<File | null>(null);
const resultThumbnail = computed(() => resultFile.value ? URL.createObjectURL(resultFile.value) : '');
// Bumped whenever the file list changes so a render still in flight for the
// old list cannot overwrite the new selection's result.
let generation = 0;

function onFileChange(selected: File[]) {
  generation++;
  files.value = selected;
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
  if (!files.value.length || !isLoaded.value) return;
  const current = generation;
  processing.value = true;
  error.value = '';
  resultData.value = null;

  try {
    const imageBytes = await Promise.all(
      files.value.map(f => f.arrayBuffer().then(ab => new Uint8Array(ab))),
    );

    const result = await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
      const inputNames: string[] = [];
      for (let i = 0; i < imageBytes.length; i++) {
        const ext = files.value[i].name.split('.').pop() ?? 'png';
        const inputName = tempFile(`.${ext}`);
        await ffmpeg.writeFile(inputName, imageBytes[i]);
        inputNames.push(inputName);
      }

      const listName = tempFile('.txt');
      const outputName = tempFile('.gif');
      const { listContent, args } = buildImagesToGifCommand({
        inputNames,
        listName,
        outputName,
        frameDuration: frameDuration.value,
      });
      await ffmpeg.writeFile(listName, listContent);

      await ffmpeg.exec(args);
      return (await ffmpeg.readFile(outputName)) as Uint8Array;
    });

    resultData.value = current === generation ? result : resultData.value;
  } catch (e: unknown) {
    if (current === generation) error.value = e instanceof Error ? e.message : t('common.processingFailed');
  } finally {
    processing.value = false;
  }
}

async function copy() {
  if (!resultData.value) return;
  const blob = new Blob([resultData.value], { type: 'image/gif' });
  await copyFileToClipboard(blob);
}

watch(resultData, (data) => {
  if (data) {
    const blob = new Blob([data], { type: 'image/gif' });
    resultFile.value = new File([blob], 'animation.gif', { type: 'image/gif' });
  } else {
    resultFile.value = null;
  }
});
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <NButton v-if="!isLoaded" :loading="isLoading" @click="load" size="small">
            {{ t('tool.loadFfmpeg') }}
          </NButton>
          <NProgress v-if="isLoading" type="line" :percentage="Math.round(loadProgress * 100)" />
          <NAlert v-if="loadError" type="error" :title="loadError" />
          <ToolFileUpload ref="fileUpload" accept="image/*" multiple compact @change="onFileChange" />
          <div v-if="files.length" style="font-size: 13px; color: var(--color-text-3)">
            {{ t('tools.imagesToGif.filesSelected', { count: files.length }) }}
          </div>
        </template>
        <template #output-files>
          <FileCard v-if="resultFile" name="animation.gif" :file="resultFile" :thumbnail-url="resultUrl" />
        </template>
        <template #actions-right>
          <NButton :disabled="!resultData" @click="copy">{{ t('tool.copyFile') }}</NButton>
          <NButton :disabled="!resultData" @click="resultData && downloadBlob(resultData, 'animation.gif', 'image/gif')">{{ t('tool.exportFile') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <NInputNumber
              v-model:value="frameDuration"
              :min="0.1"
              :max="10"
              :step="0.1"
              :placeholder="t('tools.imagesToGif.frameDuration')"
              style="width: 200px"
              :input-props="{ id: 'imagesToGifField0' }"
            />
            <NButton
              type="primary"
              :loading="processing"
              :disabled="!files.length || !isLoaded"
              @click="process"
              block
            >
              {{ t('tools.imagesToGif.createGif') }}
            </NButton>
            <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
            <NAlert v-if="error" type="error" :title="error" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>
