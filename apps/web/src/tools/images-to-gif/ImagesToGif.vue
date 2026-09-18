<script setup lang="ts">
import { NCard, NSpace, NButton, NAlert, NInputNumber, NProgress } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useFFmpeg, runFFmpegTask } from '@/composables/useFFmpeg';
import { tool } from './index';

const { isLoaded, isLoading, load, loadProgress } = useFFmpeg();

const files = ref<File[]>([]);
const frameDuration = ref(0.5);
const processing = ref(false);
const error = ref('');
const resultData = ref<Uint8Array | null>(null);

function onFileChange(event: Event) {
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

    resultData.value = result;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Processing failed';
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
          Load FFmpeg
        </NButton>
        <NProgress v-if="isLoading" type="line" :percentage="Math.round(loadProgress * 100)" />

        <input type="file" accept="image/*" multiple @change="onFileChange" />

        <div v-if="files.length" style="font-size: 13px; color: var(--n-text-color-3)">
          {{ files.length }} file(s) selected
        </div>

        <NSpace>
          <NInputNumber
            v-model:value="frameDuration"
            :min="0.1"
            :max="10"
            :step="0.1"
            placeholder="Frame duration (s)"
            style="width: 200px"
          />
        </NSpace>

        <NButton
          type="primary"
          :loading="processing"
          :disabled="!files.length || !isLoaded"
          @click="process"
        >
          Create GIF
        </NButton>

        <NAlert v-if="processing" type="info" title="Processing..." />
        <NAlert v-if="error" type="error" :title="error" />

        <NButton v-if="resultData" @click="downloadBlob(resultData, 'animation.gif', 'image/gif')">
          Download GIF
        </NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
