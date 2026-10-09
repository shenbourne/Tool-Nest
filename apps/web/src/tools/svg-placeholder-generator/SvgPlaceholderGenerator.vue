<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NInput, NButton, NInputNumber, NColorPicker, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import FileCard from '@/components/FileCard.vue';
import { generateSvgPlaceholder, svgToDataUrl, downloadSvg } from './svg-placeholder-generator.service';

const { t } = useI18n();
const { copyFileToClipboard } = useCopy();
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

const resultFile = ref<File | null>(null);
watch(dataUrl, async (url) => {
  if (!url) { resultFile.value = null; return; }
  const res = await fetch(url);
  const blob = await res.blob();
  resultFile.value = new File([blob], `placeholder-${width.value}x${height.value}.svg`, { type: 'image/svg+xml' });
});

function download() {
  downloadSvg(svgCode.value, `placeholder-${width.value}x${height.value}.svg`);
}

async function copySvgFile() {
  const res = await fetch(dataUrl.value);
  const blob = await res.blob();
  await copyFileToClipboard(blob);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel :input-text="''" :output-text="svgCode" :output-title="t('tools.svgPlaceholderGenerator.svgCode')" export-name="placeholder.svg" hide-input>
      <template #output>
        <NInput
          :value="svgCode"
          type="textarea"
          readonly
          :autosize="{ minRows: 4, maxRows: 10 }"
          style="font-family: monospace;"
         :input-props="{ id: 'svgPlaceholderGeneratorField4' }"/>
      </template>
      <template #params>
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
          <FileCard v-if="resultFile" :name="`placeholder-${width}x${height}.svg`" :file="resultFile" file-type="image/svg+xml" />
          <NSpace>
            <NButton @click="download">{{ t('tools.svgPlaceholderGenerator.downloadSvg') }}</NButton>
            <NButton @click="copySvgFile">{{ t('tool.copyFile') }}</NButton>
          </NSpace>
        </NSpace>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
