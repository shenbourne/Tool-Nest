<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NInputNumber, NInput, NButton, NSpace, NFormItem, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import * as forge from 'node-forge';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const keySize = ref(2048);
const publicKey = ref('');
const privateKey = ref('');
const generating = ref(false);
const error = ref('');

function generate() {
  generating.value = true;
  error.value = '';
  try {
    const keypair = forge.pki.rsa.generateKeyPair({ bits: keySize.value, workers: -1 });
    publicKey.value = forge.pki.publicKeyToPem(keypair.publicKey);
    privateKey.value = forge.pki.privateKeyToPem(keypair.privateKey);
  } catch (e: any) {
    error.value = e.message || 'Failed to generate key pair';
  } finally {
    generating.value = false;
  }
}

function copyPublic() { navigator.clipboard.writeText(publicKey.value); }
function copyPrivate() { navigator.clipboard.writeText(privateKey.value); }
</script>

<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard>
        <NSpace vertical :size="12">
          <NFormItem label="Key size (bits)" label-placement="left">
            <NInputNumber v-model:value="keySize" :min="512" :max="4096" :step="512" style="width: 200px;" />
          </NFormItem>
          <NButton type="primary" @click="generate" :loading="generating">Generate Key Pair</NButton>
        </NSpace>
      </NCard>

      <NAlert v-if="error" type="error">{{ error }}</NAlert>

      <NCard v-if="publicKey" title="Public Key">
        <NInput :value="publicKey" readonly type="textarea" :rows="6" style="font-family: monospace; font-size: 12px;" />
        <NButton size="small" style="margin-top: 8px;" @click="copyPublic">{{ t('tool.copy') }}</NButton>
      </NCard>

      <NCard v-if="privateKey" title="Private Key">
        <NInput :value="privateKey" readonly type="textarea" :rows="10" style="font-family: monospace; font-size: 12px;" />
        <NButton size="small" style="margin-top: 8px;" @click="copyPrivate">{{ t('tool.copy') }}</NButton>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
