<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NInput, NSpace, NButton, NSelect, NSwitch, NColorPicker } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { useWifiQrCode, downloadDataUrl, type WifiEncryption } from './wifi-qr-code-generator.service';
import { useCopy } from '@/composables/useCopy';
import FileCard from '@/components/FileCard.vue';

const { t } = useI18n();
const tool = useCurrentTool();
const { copyImageToClipboard } = useCopy();

const ssid = ref('');
const password = ref('');
const encryption = ref<WifiEncryption>('WPA');
const hidden = ref(false);
const foreground = ref('#000000');
const background = ref('#ffffff');

const encryptionOptions = [
  { label: t('tools.wifiQrCodeGenerator.noPassword'), value: 'nopass' },
  { label: 'WPA/WPA2', value: 'WPA' },
  { label: 'WEP', value: 'WEP' },
  { label: 'WPA2-EAP', value: 'WPA2-EAP' },
];

const { dataUrl } = useWifiQrCode({
  ssid,
  encryption,
  password,
  hidden,
  foreground,
  background,
});

const resultFile = ref<File | null>(null);
watch(dataUrl, async (url) => {
  if (!url) { resultFile.value = null; return; }
  const res = await fetch(url);
  const blob = await res.blob();
  resultFile.value = new File([blob], 'wifi-qrcode.png', { type: 'image/png' });
});

function download() {
  if (dataUrl.value) {
    downloadDataUrl(dataUrl.value, 'wifi-qrcode.png');
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
    <NSpace vertical :size="16">
      <NCard :title="t('tools.wifiQrCodeGenerator.settingsTitle')">
        <NSpace vertical :size="12">
          <div>
            <div style="margin-bottom: 4px; font-size: 13px;">{{ t('tools.wifiQrCodeGenerator.encryption') }}</div>
            <NSelect v-model:value="encryption" :options="encryptionOptions" style="width: 200px;" />
          </div>
          <div>
            <div style="margin-bottom: 4px; font-size: 13px;">{{ t('tools.wifiQrCodeGenerator.ssid') }}</div>
            <NInput v-model:value="ssid" :placeholder="t('tools.wifiQrCodeGenerator.ssidPlaceholder')" clearable  :input-props="{ id: 'wifiQrCodeGeneratorField0' }"/>
          </div>
          <div v-if="encryption !== 'nopass'">
            <div style="margin-bottom: 4px; font-size: 13px;">{{ t('common.password') }}</div>
            <NInput v-model:value="password" type="password" show-password-on="click" :placeholder="t('tools.wifiQrCodeGenerator.passwordPlaceholder')" clearable  :input-props="{ id: 'wifiQrCodeGeneratorField1' }"/>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 13px;">{{ t('tools.wifiQrCodeGenerator.hiddenNetwork') }}</span>
            <NSwitch v-model:value="hidden" />
          </div>
          <NSpace :size="12" style="margin-top: 8px;">
            <div>
              <div style="margin-bottom: 4px; font-size: 13px;">{{ t('common.foreground') }}</div>
              <NColorPicker v-model:value="foreground" :show-alpha="false" size="small" style="width: 100px;" />
            </div>
            <div>
              <div style="margin-bottom: 4px; font-size: 13px;">{{ t('common.background') }}</div>
              <NColorPicker v-model:value="background" :show-alpha="false" size="small" style="width: 100px;" />
            </div>
          </NSpace>
        </NSpace>
      </NCard>

      <NCard :title="t('common.qrCode')">
        <FileCard v-if="resultFile" name="wifi-qrcode.png" :file="resultFile" file-type="image/png" />
        <div v-else style="text-align: center; color: var(--color-text-3); padding: 40px 0;">
          {{ t('tools.wifiQrCodeGenerator.emptyHint') }}
        </div>
        <NSpace v-if="dataUrl">
          <NButton @click="download">{{ t('tool.download') }}</NButton>
          <NButton @click="copyImage">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
