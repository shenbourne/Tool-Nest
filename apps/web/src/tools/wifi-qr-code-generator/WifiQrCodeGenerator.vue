<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NInput, NSpace, NButton, NSelect, NSwitch, NColorPicker } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { useWifiQrCode, downloadDataUrl, type WifiEncryption } from './wifi-qr-code-generator.service';

const { t } = useI18n();
const tool = useCurrentTool();

const ssid = ref('');
const password = ref('');
const encryption = ref<WifiEncryption>('WPA');
const hidden = ref(false);
const foreground = ref('#000000');
const background = ref('#ffffff');

const encryptionOptions = [
  { label: 'No Password', value: 'nopass' },
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
  navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="WiFi Settings">
        <NSpace vertical :size="12">
          <div>
            <div style="margin-bottom: 4px; font-size: 13px;">Encryption</div>
            <NSelect v-model:value="encryption" :options="encryptionOptions" style="width: 200px;" />
          </div>
          <div>
            <div style="margin-bottom: 4px; font-size: 13px;">SSID (Network Name)</div>
            <NInput v-model:value="ssid" placeholder="Enter WiFi network name" clearable />
          </div>
          <div v-if="encryption !== 'nopass'">
            <div style="margin-bottom: 4px; font-size: 13px;">Password</div>
            <NInput v-model:value="password" type="password" show-password-on="click" placeholder="Enter password" clearable />
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 13px;">Hidden network</span>
            <NSwitch v-model:value="hidden" />
          </div>
          <NSpace :size="12" style="margin-top: 8px;">
            <div>
              <div style="margin-bottom: 4px; font-size: 13px;">Foreground</div>
              <NColorPicker v-model:value="foreground" :show-alpha="false" size="small" style="width: 100px;" />
            </div>
            <div>
              <div style="margin-bottom: 4px; font-size: 13px;">Background</div>
              <NColorPicker v-model:value="background" :show-alpha="false" size="small" style="width: 100px;" />
            </div>
          </NSpace>
        </NSpace>
      </NCard>

      <NCard title="QR Code">
        <div v-if="dataUrl" style="text-align: center; margin-bottom: 16px;">
          <img :src="dataUrl" alt="WiFi QR Code" style="max-width: 300px; width: 100%;" />
        </div>
        <div v-else style="text-align: center; color: var(--color-text-3); padding: 40px 0;">
          Enter WiFi details above to generate QR code
        </div>
        <NSpace v-if="dataUrl">
          <NButton @click="download">{{ t('tool.download') }}</NButton>
          <NButton @click="copyImage">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
