<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NInputNumber, NColorPicker } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { generateSvgPlaceholder, svgToDataUrl, downloadSvg } from './svg-placeholder-generator.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
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
  copyToClipboard(svgCode.value);
}

function download() {
  downloadSvg(svgCode.value, `placeholder-${width.value}x${height.value}.svg`);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('common.settings')">
        <NSpace vertical :size="12">
          <NSpace :size="12">
            <div>
              <div style="margin-bottom: 4px; font-size: 13px;">{{ t('common.width') }}</div>
              <NInputNumber v-model:value="width" :min="1" :max="4000" style="width: 120px;"  :input-props="{ id: 'svgPlaceholderGeneratorField0' }"/>
            </div>
            <div>
              <div style="margin-bottom: 4px; font-size: 13px;">{{ t('common.height') }}</div>
              <NInputNumber v-model:value="height" :min="1" :max="4000" style="width: 120px;"  :input-props="{ id: 'svgPlaceholderGeneratorField1' }"/>
            </div>
            <div>
              <div style="margin-bottom: 4px; font-size: 13px;">{{ t('tools.svgPlaceholderGenerator.fontSize') }}</div>
              <NInputNumber v-model:value="fontSize" :min="1" :max="200" :placeholder="t('tools.svgPlaceholderGenerator.auto')" style="width: 120px;"  :input-props="{ id: 'svgPlaceholderGeneratorField2' }"/>
            </div>
          </NSpace>
          <NSpace :size="12">
            <div>
              <div style="margin-bottom: 4px; font-size: 13px;">{{ t('common.background') }}</div>
              <NColorPicker v-model:value="bgColor" :show-alpha="false" size="small" style="width: 100px;" />
            </div>
            <div>
              <div style="margin-bottom: 4px; font-size: 13px;">{{ t('tools.svgPlaceholderGenerator.textColor') }}</div>
              <NColorPicker v-model:value="fgColor" :show-alpha="false" size="small" style="width: 100px;" />
            </div>
          </NSpace>
          <div>
            <div style="margin-bottom: 4px; font-size: 13px;">{{ t('tools.svgPlaceholderGenerator.customText') }}</div>
            <NInput v-model:value="customText" :placeholder="t('tools.svgPlaceholderGenerator.customTextPlaceholder')" clearable  :input-props="{ id: 'svgPlaceholderGeneratorField3' }"/>
          </div>
        </NSpace>
      </NCard>

      <NCard :title="t('common.preview')">
        <div style="text-align: center; margin-bottom: 16px;">
          <img :src="dataUrl" :alt="t('tools.svgPlaceholderGenerator.alt')" style="max-width: 100%; border: 1px solid var(--color-hairline);" />
        </div>
        <NSpace>
          <NButton @click="download">{{ t('tools.svgPlaceholderGenerator.downloadSvg') }}</NButton>
        </NSpace>
      </NCard>

      <NCard :title="t('tools.svgPlaceholderGenerator.svgCode')">
        <NInput
          :value="svgCode"
          type="textarea"
          readonly
          :autosize="{ minRows: 4, maxRows: 10 }"
          style="font-family: monospace;"
         :input-props="{ id: 'svgPlaceholderGeneratorField4' }"/>
        <NButton @click="copySvg" style="margin-top: 8px;">
          {{ t('tool.copy') }}
        </NButton>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
