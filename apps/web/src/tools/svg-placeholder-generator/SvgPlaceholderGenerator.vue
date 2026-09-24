<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NInputNumber, NColorPicker } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { generateSvgPlaceholder, svgToDataUrl, downloadSvg } from './svg-placeholder-generator.service';

const { t } = useI18n();
const tool = useCurrentTool();

const width = ref(300);
const height = ref(150);
const bgColor = ref('#cccccc');
const fgColor = ref('#333333');
const customText = ref('');
const fontSize = ref<number | null>(null);

const svgCode = computed(() =>
  generateSvgPlaceholder(
    width.value,
    height.value,
    bgColor.value,
    fgColor.value,
    customText.value || undefined,
    fontSize.value || undefined,
  ),
);

const dataUrl = computed(() => svgToDataUrl(svgCode.value));

function copySvg() {
  navigator.clipboard.writeText(svgCode.value);
}

function download() {
  downloadSvg(svgCode.value, `placeholder-${width.value}x${height.value}.svg`);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Settings">
        <NSpace vertical :size="12">
          <NSpace :size="12">
            <div>
              <div style="margin-bottom: 4px; font-size: 13px;">Width</div>
              <NInputNumber v-model:value="width" :min="1" :max="4000" style="width: 120px;" />
            </div>
            <div>
              <div style="margin-bottom: 4px; font-size: 13px;">Height</div>
              <NInputNumber v-model:value="height" :min="1" :max="4000" style="width: 120px;" />
            </div>
            <div>
              <div style="margin-bottom: 4px; font-size: 13px;">Font Size</div>
              <NInputNumber v-model:value="fontSize" :min="1" :max="200" placeholder="Auto" style="width: 120px;" />
            </div>
          </NSpace>
          <NSpace :size="12">
            <div>
              <div style="margin-bottom: 4px; font-size: 13px;">Background</div>
              <NColorPicker v-model:value="bgColor" :show-alpha="false" size="small" style="width: 100px;" />
            </div>
            <div>
              <div style="margin-bottom: 4px; font-size: 13px;">Text Color</div>
              <NColorPicker v-model:value="fgColor" :show-alpha="false" size="small" style="width: 100px;" />
            </div>
          </NSpace>
          <div>
            <div style="margin-bottom: 4px; font-size: 13px;">Custom Text</div>
            <NInput v-model:value="customText" placeholder="Default: width x height" clearable />
          </div>
        </NSpace>
      </NCard>

      <NCard title="Preview">
        <div style="text-align: center; margin-bottom: 16px;">
          <img :src="dataUrl" alt="SVG Placeholder" style="max-width: 100%; border: 1px solid var(--color-hairline);" />
        </div>
        <NSpace>
          <NButton @click="download">{{ t('tool.download') }} SVG</NButton>
        </NSpace>
      </NCard>

      <NCard title="SVG Code">
        <NInput
          :value="svgCode"
          type="textarea"
          readonly
          :autosize="{ minRows: 4, maxRows: 10 }"
          style="font-family: monospace;"
        />
        <NButton @click="copySvg" style="margin-top: 8px;">
          {{ t('tool.copy') }}
        </NButton>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
