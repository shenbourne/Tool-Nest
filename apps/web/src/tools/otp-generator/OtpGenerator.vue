<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { NCard, NInput, NSpace, NButton, NProgress, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { generateSecret, generateTOTP, verifyTOTP, buildKeyUri, getTimeRemaining } from './otp-generator.service';
import QRCode from 'qrcode';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
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
  copyToClipboard(secret.value);
}

function copyToken() {
  copyToClipboard(token.value);
}

function verify() {
  if (!verifyInput.value.trim()) {
    verifyResult.value = { valid: false, message: t('tools.otpGenerator.pleaseEnterToken') };
    return;
  }
  const valid = verifyTOTP(verifyInput.value.trim(), secret.value);
  verifyResult.value = {
    valid,
    message: valid ? t('tools.otpGenerator.tokenValid') : t('tools.otpGenerator.tokenInvalid'),
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

watch([secret, issuer, account], () => {
  updateToken();
  updateQr();
  verifyResult.value = null;
});
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.otpGenerator.secretKey')">
        <NSpace vertical :size="12">
          <NInput :value="secret" readonly :placeholder="t('tools.otpGenerator.secretKey')" style="font-family: monospace;" :input-props="{ id: 'otpGeneratorField0' }">
            <template #suffix>
              <NButton text @click="copySecret">{{ t('tool.copy') }}</NButton>
            </template>
          </NInput>
          <NButton @click="regenerate">{{ t('tools.otpGenerator.generateNewSecret') }}</NButton>
        </NSpace>
      </NCard>

      <NCard :title="t('tools.otpGenerator.currentToken')">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 48px; font-family: monospace; font-weight: bold; letter-spacing: 8px;">
            {{ token }}
          </div>
          <div style="margin-top: 12px; color: var(--color-text-3);">
            {{ t('tools.otpGenerator.refreshesIn', { n: remainingSeconds }) }}
          </div>
          <NProgress :percentage="countdown" :show-indicator="false" :rail-height="6" style="margin-top: 8px;" />
        </div>
        <NSpace justify="center">
          <NButton @click="copyToken">{{ t('tools.otpGenerator.copyToken') }}</NButton>
        </NSpace>
      </NCard>

      <NCard :title="t('tools.otpGenerator.verifyToken')">
        <NSpace vertical :size="12">
          <NInput v-model:value="verifyInput" :placeholder="t('tools.otpGenerator.verifyPlaceholder')" clearable style="max-width: 300px;" @keyup.enter="verify"  :input-props="{ id: 'otpGeneratorField1' }"/>
          <NButton @click="verify">{{ t('tools.otpGenerator.verify') }}</NButton>
          <NAlert v-if="verifyResult" :type="verifyResult.valid ? 'success' : 'error'" :title="verifyResult.message" />
        </NSpace>
      </NCard>

      <NCard :title="t('tools.otpGenerator.qrCodeTitle')">
        <NSpace vertical :size="12">
          <div style="margin-bottom: 8px; font-size: 13px;">
            <NSpace :size="12">
              <div>
                <div style="margin-bottom: 4px; font-size: 13px;">{{ t('tools.otpGenerator.issuer') }}</div>
                <NInput v-model:value="issuer" :placeholder="t('tools.otpGenerator.issuer')" size="small" style="width: 150px;"  :input-props="{ id: 'otpGeneratorField2' }"/>
              </div>
              <div>
                <div style="margin-bottom: 4px; font-size: 13px;">{{ t('tools.otpGenerator.account') }}</div>
                <NInput v-model:value="account" :placeholder="t('tools.otpGenerator.account')" size="small" style="width: 150px;"  :input-props="{ id: 'otpGeneratorField3' }"/>
              </div>
            </NSpace>
          </div>
          <div v-if="qrDataUrl" style="text-align: center;">
            <img :src="qrDataUrl" :alt="t('tools.otpGenerator.qrCodeAlt')" style="max-width: 256px; width: 100%;" />
          </div>
          <div v-else style="text-align: center; color: var(--color-text-3); padding: 20px;">
            {{ t('tools.otpGenerator.noQrCode') }}
          </div>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
