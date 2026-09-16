<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSelect, NButton, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { AES, RC4, Rabbit, TripleDES, enc } from 'crypto-js';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const algos = { AES, TripleDES, Rabbit, RC4 };
type Algo = keyof typeof algos;
const algoOptions = Object.keys(algos).map(l => ({ label: l, value: l }));

const encryptInput = ref('Lorem ipsum dolor sit amet');
const encryptAlgo = ref<Algo>('AES');
const encryptSecret = ref('my secret key');
const encryptOutput = computed(() => algos[encryptAlgo.value].encrypt(encryptInput.value, encryptSecret.value).toString());

const decryptInput = ref('');
const decryptAlgo = ref<Algo>('AES');
const decryptSecret = ref('my secret key');
const decryptOutput = ref('');
const decryptError = ref('');

function doDecrypt() {
  try {
    decryptError.value = '';
    decryptOutput.value = algos[decryptAlgo.value].decrypt(decryptInput.value, decryptSecret.value).toString(enc.Utf8);
  } catch {
    decryptOutput.value = '';
    decryptError.value = 'Unable to decrypt your text';
  }
}

function copy() { navigator.clipboard.writeText(encryptOutput.value); }
</script>

<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Encrypt">
        <NSpace vertical :size="12">
          <NInput v-model:value="encryptInput" type="textarea" :rows="3" placeholder="Text to encrypt..." />
          <NInput v-model:value="encryptSecret" placeholder="Secret key..." />
          <NSelect v-model:value="encryptAlgo" :options="algoOptions" />
          <NInput :value="encryptOutput" readonly type="textarea" :rows="2" style="font-family: monospace;" />
          <NButton @click="copy">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>

      <NCard title="Decrypt">
        <NSpace vertical :size="12">
          <NInput v-model:value="decryptInput" type="textarea" :rows="3" placeholder="Encrypted text..." />
          <NInput v-model:value="decryptSecret" placeholder="Secret key..." />
          <NSelect v-model:value="decryptAlgo" :options="algoOptions" />
          <NAlert v-if="decryptError" type="error">{{ decryptError }}</NAlert>
          <NInput v-else-if="decryptOutput" :value="decryptOutput" readonly type="textarea" :rows="2" style="font-family: monospace;" />
          <NButton @click="doDecrypt">Decrypt</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
