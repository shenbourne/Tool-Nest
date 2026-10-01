<script setup lang="ts">
import { ref, watch } from 'vue';
import { NCard, NSpace, NButton, NInputNumber, NAlert } from 'naive-ui';
import FileCard from '@/components/FileCard.vue';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFilePanel from '@/components/ToolFilePanel.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { useCopy } from '@/composables/useCopy';
const fileUpload = ref<InstanceType<typeof ToolFileUpload> | null>(null);

const { t } = useI18n();
const tool = useCurrentTool();
const { copyFileToClipboard } = useCopy();

const file = ref<File | null>(null);
const imageUrl = ref<string>('');
const rows = ref(2);
const cols = ref(2);
const tiles = ref<string[]>([]);
const tileFiles = ref<File[]>([]);
const error = ref('');

function onFileChange(files: File[]) {
  const f = files[0] ?? null;
  file.value = f;
  tiles.value = [];
  tileFiles.value = [];
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  imageUrl.value = f ? URL.createObjectURL(f) : '';
}

function splitImage() {
  if (!file.value) return;
  error.value = '';
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const newTiles: string[] = [];
    const tileW = Math.floor(img.width / cols.value);
    const tileH = Math.floor(img.height / rows.value);
    for (let r = 0; r < rows.value; r++) {
      for (let c = 0; c < cols.value; c++) {
        const canvas = document.createElement('canvas');
        canvas.width = tileW;
        canvas.height = tileH;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        ctx.drawImage(img, c * tileW, r * tileH, tileW, tileH, 0, 0, tileW, tileH);
        newTiles.push(canvas.toDataURL('image/png'));
      }
    }
    tiles.value = newTiles;
  };
  img.onerror = () => {
    tiles.value = [];
    error.value = t('common.processingFailed');
  };
  img.src = imageUrl.value;
}

watch([rows, cols], () => {
  if (file.value) splitImage();
});

watch(tiles, async (newTiles) => {
  if (!newTiles.length) {
    tileFiles.value = [];
    return;
  }
  const files: File[] = [];
  for (let i = 0; i < newTiles.length; i++) {
    const res = await fetch(newTiles[i]);
    const blob = await res.blob();
    files.push(new File([blob], `tile_${i + 1}.png`, { type: 'image/png' }));
  }
  tileFiles.value = files;
});

function downloadTile(dataUrl: string, idx: number) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `tile_${idx + 1}.png`;
  a.click();
}

async function copyTile(dataUrl: string) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  await copyFileToClipboard(blob);
}

function downloadAll() {
  tiles.value.forEach((tile, idx) => downloadTile(tile, idx));
}
onUnmounted(() => {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
});
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NCard>
      <ToolFilePanel @request-paste="fileUpload?.triggerPaste()" @request-import="fileUpload?.triggerSelect()">
        <template #input-files>
          <ToolFileUpload ref="fileUpload" accept="image/*" compact @change="onFileChange" />
        </template>
        <template #output-files>
          <div v-if="tileFiles.length" class="tool-file-panel__output-grid">
            <FileCard v-for="(tf, idx) in tileFiles" :key="idx" :name="`tile_${idx + 1}.png`" :file="tf" file-type="image/png" />
          </div>
        </template>
        <template #actions-right>
          <NButton v-if="tiles.length" @click="downloadAll">{{ t('tools.imageSplit.downloadAll') }}</NButton>
        </template>
        <template #params>
          <NSpace vertical :size="12">
            <div>
              <label :for="'imageSplitField0'">{{ t('tools.imageSplit.rows') }}</label>
              <NInputNumber v-model:value="rows" :min="1" :max="10" :step="1"  :input-props="{ id: 'imageSplitField0' }"/>
            </div>
            <div>
              <label :for="'imageSplitField1'">{{ t('tools.imageSplit.columns') }}</label>
              <NInputNumber v-model:value="cols" :min="1" :max="10" :step="1"  :input-props="{ id: 'imageSplitField1' }"/>
            </div>
            <NButton type="primary" :disabled="!file" @click="splitImage" block>
              {{ t('tools.imageSplit.split') }}
            </NButton>
            <NAlert v-if="error" type="error" :title="error" />
          </NSpace>
        </template>
      </ToolFilePanel>
    </NCard>
  </ToolLayout>
</template>

<style scoped>
.tool-file-panel__output-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  gap: 8px;
  width: 100%;
}
</style>
