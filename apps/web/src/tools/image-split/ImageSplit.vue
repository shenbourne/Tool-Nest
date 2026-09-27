<script setup lang="ts">
import { ref, watch } from 'vue';
import { NCard, NSpace, NButton, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const tool = useCurrentTool();

const file = ref<File | null>(null);
const imageUrl = ref<string>('');
const rows = ref(2);
const cols = ref(2);
const tiles = ref<string[]>([]);

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const f = input.files?.[0];
  if (f) {
    file.value = f;
    if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
    imageUrl.value = URL.createObjectURL(f);
  }
}

function splitImage() {
  if (!file.value) return;
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
  img.src = imageUrl.value;
}

watch([rows, cols], () => {
  if (file.value) splitImage();
});

function downloadTile(dataUrl: string, idx: number) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `tile_${idx + 1}.png`;
  a.click();
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
    <NSpace vertical :size="16">
      <NCard :title="t('tools.imageSplit.name')">
        <NSpace vertical :size="12">
          <div>
            <label for="file-upload">{{ t('common.uploadFile', 'Upload an image') }}</label>
            <input id="file-upload" type="file" accept="image/*" @change="onFileChange" style="display:block;margin-top:8px;" />
          </div>
          <div v-if="imageUrl" style="position:relative;display:inline-block;">
            <img :src="imageUrl" style="max-width:100%;" />
          </div>
        </NSpace>
      </NCard>
      <NCard :title="t('common.settings', 'Settings')">
        <NSpace vertical :size="12">
          <div>
            <label>{{ t('tools.imageSplit.rows') }}</label>
            <NInputNumber v-model:value="rows" :min="1" :max="10" :step="1" />
          </div>
          <div>
            <label>{{ t('tools.imageSplit.columns') }}</label>
            <NInputNumber v-model:value="cols" :min="1" :max="10" :step="1" />
          </div>
          <NButton type="primary" :disabled="!file" @click="splitImage">{{ t('tools.imageSplit.split') }}</NButton>
        </NSpace>
      </NCard>
      <NCard v-if="tiles.length" :title="t('tools.imageSplit.tiles')">
        <NSpace vertical :size="12">
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(150px, 1fr));gap:8px;">
            <div v-for="(tile, idx) in tiles" :key="idx">
              <img :src="tile" style="width:100%;border:1px solid var(--color-hairline);" />
              <NButton size="small" @click="downloadTile(tile, idx)" style="margin-top:4px;">{{ t('tool.download') }}</NButton>
            </div>
          </div>
          <NButton type="success" @click="downloadAll">{{ t('tools.imageSplit.downloadAll') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
