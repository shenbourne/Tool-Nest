<script setup lang="ts">
import { ref, watch } from 'vue';
import { NInput, NButton, NColorPicker, NSelect, NAlert, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { useQrCode, downloadDataUrl } from './qr-code-generator.service';
import { useCopy } from '@/composables/useCopy';
import FileCard from '@/components/FileCard.vue';

const { t } = useI18n();
const tool = useCurrentTool();
const { copyImageToClipboard } = useCopy();

const text = ref('');
const foreground = ref('#000000');
const background = ref('#ffffff');
const errorCorrectionLevel = ref('M');

const eclOptions = [
  { label: 'L (7%)', value: 'L' },
  { label: 'M (15%)', value: 'M' },
  { label: 'Q (25%)', value: 'Q' },
  { label: 'H (30%)', value: 'H' },
];

const { dataUrl, error: qrError } = useQrCode(text, {
  foreground,
  background,
  errorCorrectionLevel,
});

const resultFile = ref<File | null>(null);
watch(dataUrl, async (url) => {
  if (!url) { resultFile.value = null; return; }
  const res = await fetch(url);
  const blob = await res.blob();
  resultFile.value = new File([blob], 'qrcode.png', { type: 'image/png' });
});

function download() {
  if (dataUrl.value) {
    downloadDataUrl(dataUrl.value, 'qrcode.png');
  }
}

function copyImage() {
  if (!dataUrl.value) return;
  const match = dataUrl.value.match(/^data:(.*?);base64,(.*)$/);
  if (!match) return;
  const b64 = match[2];
  const byteChars = atob(b64);
  const byteArray = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteArray[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteArray], { type: 'image/png' });
  copyImageToClipboard(blob);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="text" :output-text="dataUrl || ''" :input-title="t('common.input')" :output-title="t('common.qrCode')" hide-output>
      <template #input>
        <NInput
          v-model:value="text"
          type="textarea"
          :placeholder="t('tools.qrCodeGenerator.inputPlaceholder')"
          :autosize="{ minRows: 2, maxRows: 6 }"
         :input-props="{ id: 'qrCodeGeneratorField0' }"/>
      </template>
      <template #params>
        <NSpace :size="12">
          <div>
            <div style="margin-bottom: 4px; font-size: 13px;">{{ t('common.foreground') }}</div>
            <NColorPicker v-model:value="foreground" :show-alpha="false" size="small" style="width: 100px;" />
          </div>
          <div>
            <div style="margin-bottom: 4px; font-size: 13px;">{{ t('common.background') }}</div>
            <NColorPicker v-model:value="background" :show-alpha="false" size="small" style="width: 100px;" />
          </div>
          <div>
            <div style="margin-bottom: 4px; font-size: 13px;">{{ t('tools.qrCodeGenerator.errorCorrection') }}</div>
            <NSelect v-model:value="errorCorrectionLevel" :options="eclOptions" style="width: 140px;" size="small" />
          </div>
        </NSpace>
        <NAlert v-if="qrError" type="error" :title="t('tools.qrCodeGenerator.generationFailed')" />
        <FileCard v-else-if="resultFile" name="qrcode.png" :file="resultFile" file-type="image/png" />
        <div v-else style="text-align: center; color: var(--color-text-3); padding: 40px 0;">
          {{ t('tools.qrCodeGenerator.emptyHint') }}
        </div>
        <NSpace v-if="dataUrl">
          <NButton @click="download">{{ t('tool.download') }}</NButton>
          <NButton @click="copyImage">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
