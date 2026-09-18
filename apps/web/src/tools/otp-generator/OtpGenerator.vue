<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { NCard, NInput, NSpace, NButton, NProgress, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { generateSecret, generateTOTP, verifyTOTP, buildKeyUri, getTimeRemaining } from './otp-generator.service';
import QRCode from 'qrcode';

const { t } = useI18n();
const tool = useCurrentTool();

const secret = ref(generateSecret());
const token = ref('');
const countdown = ref(100);
const remainingSeconds = ref(30);
const verifyInput = ref('');
const verifyResult = ref<{ valid: boolean; message: string } | null>(null);
const qrDataUrl = ref('');

const issuer = ref('ToolNest');
const account = ref('user');

function regenerate() {
  secret.value = generateSecret();
}

function updateToken() {
  token.value = generateTOTP(secret.value);
  const { remaining, total } = getTimeRemaining();
  countdown.value = (remaining / total) * 100;
  remainingSeconds.value = Math.ceil(remaining / 1000);
}

async function updateQr() {
  const uri = buildKeyUri(secret.value, issuer.value, account.value);
  try {
    qrDataUrl.value = await QRCode.toDataURL(uri, { width: 256, errorCorrectionLevel: 'M' });
  } catch {
    qrDataUrl.value = '';
  }
}

function copySecret() {
  navigator.clipboard.writeText(secret.value);
}

function copyToken() {
  navigator.clipboard.writeText(token.value);
}

function verify() {
  if (!verifyInput.value.trim()) {
    verifyResult.value = { valid: false, message: 'Please enter a token' };
    return;
  }
  const valid = verifyTOTP(verifyInput.value.trim(), secret.value);
  verifyResult.value = {
    valid,
    message: valid ? 'Token is valid' : 'Token is invalid',
  };
}

let intervalId: ReturnType<typeof setInterval>;

onMounted(() => {
  updateToken();
  updateQr();
  intervalId = setInterval(() => {
    updateToken();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});

watch(secret, () => {
  updateToken();
  updateQr();
  verifyResult.value = null;
});
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Secret Key">
        <NSpace vertical :size="12">
          <NInput :value="secret" readonly placeholder="Secret key" style="font-family: monospace;">
            <template #suffix>
              <NButton text @click="copySecret">{{ t('tool.copy') }}</NButton>
            </template>
          </NInput>
          <NButton @click="regenerate">Generate new secret</NButton>
        </NSpace>
      </NCard>

      <NCard title="Current TOTP Token">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 48px; font-family: monospace; font-weight: bold; letter-spacing: 8px;">
            {{ token }}
          </div>
          <div style="margin-top: 12px; color: #999;">
            Refreshes in {{ remainingSeconds }}s
          </div>
          <NProgress :percentage="countdown" :show-indicator="false" :rail-height="6" style="margin-top: 8px;" />
        </div>
        <NSpace justify="center">
          <NButton @click="copyToken">{{ t('tool.copy') }} Token</NButton>
        </NSpace>
      </NCard>

      <NCard title="Verify Token">
        <NSpace vertical :size="12">
          <NInput v-model:value="verifyInput" placeholder="Enter token to verify" clearable style="max-width: 300px;" />
          <NButton @click="verify">Verify</NButton>
          <NAlert v-if="verifyResult" :type="verifyResult.valid ? 'success' : 'error'" :title="verifyResult.message" />
        </NSpace>
      </NCard>

      <NCard title="QR Code for Authenticator Apps">
        <NSpace vertical :size="12">
          <div style="margin-bottom: 8px; font-size: 13px;">
            <NSpace :size="12">
              <div>
                <div style="margin-bottom: 4px; font-size: 13px;">Issuer</div>
                <NInput v-model:value="issuer" placeholder="Issuer" size="small" style="width: 150px;" />
              </div>
              <div>
                <div style="margin-bottom: 4px; font-size: 13px;">Account</div>
                <NInput v-model:value="account" placeholder="Account" size="small" style="width: 150px;" />
              </div>
            </NSpace>
          </div>
          <div v-if="qrDataUrl" style="text-align: center;">
            <img :src="qrDataUrl" alt="OTP QR Code" style="max-width: 256px; width: 100%;" />
          </div>
          <div v-else style="text-align: center; color: #999; padding: 20px;">
            No QR code available
          </div>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
