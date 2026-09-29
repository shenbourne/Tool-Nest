<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NInputNumber, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { tool } from './index';

const { t } = useI18n();
const { isLoaded, isLoading, load, loadProgress, loadError } = useFFmpeg();

const files = ref<File[]>([]);
const frameDuration = ref(0.5);
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);
// Bumped whenever the file list changes so a render still in flight for the
// old list cannot overwrite the new selection's result.
let generation = 0;

function onFileChange(event: Event) {
  generation++;
  const input = event.target as HTMLInputElement;
  files.value = Array.from(input.files ?? []);
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

      const concatContent = inputNames
        .map(name => `file '${name}'\nduration ${frameDuration.value}`)
        .join('\n');
      const listName = tempFile('.txt');
      await ffmpeg.writeFile(listName, concatContent);

      const outputName = tempFile('.gif');
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', listName,
        '-vf', `fps=${Math.round(1 / frameDuration.value)},scale=480:-1:flags=lanczos`,
        '-loop', '0',
        outputName,
      ]);
      return (await ffmpeg.readFile(outputName)) as Uint8Array;
    });

    resultData.value = current === generation ? result : resultData.value;
  } catch (e: unknown) {
    if (current === generation) error.value = e instanceof Error ? e.message : t('common.processingFailed');
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

        <input type="file" accept="image/*" multiple @change="onFileChange" />

        <div v-if="files.length" style="font-size: 13px; color: var(--color-text-3)">
          {{ t('tools.imagesToGif.filesSelected', { count: files.length }) }}
        </div>

        <NSpace>
          <NInputNumber
            v-model:value="frameDuration"
            :min="0.1"
            :max="10"
            :step="0.1"
            :placeholder="t('tools.imagesToGif.frameDuration')"
            style="width: 200px"
           :input-props="{ id: 'imagesToGifField0' }"/>
        </NSpace>

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!files.length || !isLoaded"
          @click="process"
        >
          {{ t('tools.imagesToGif.createGif') }}
        </NButton>

        <NAlert v-if="processing" type="info" :title="t('tool.processing')" />
        <NAlert v-if="error" type="error" :title="error" />

        <NButton v-if="resultData" @click="downloadBlob(resultData, 'animation.gif', 'image/gif')">
          {{ t('tool.downloadGif') }}
        </NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
