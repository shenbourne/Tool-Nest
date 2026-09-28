<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSelect, NButton, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { AES, RC4, Rabbit, TripleDES, enc } from 'crypto-js';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
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
    decryptError.value = t('tools.encryption.decryptFailed');
  }
}

// A previously decrypted plaintext is tied to the inputs that produced it;
// once they change, the stale result must not linger next to the new inputs.
watch([decryptInput, decryptAlgo, decryptSecret], () => {
  decryptOutput.value = '';
  decryptError.value = '';
});

function copy() { copyToClipboard(encryptOutput.value); }
</script>

<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('common.encrypt')">
        <NSpace vertical :size="12">
          <NInput v-model:value="encryptInput" type="textarea" :rows="3" :placeholder="t('tools.encryption.encryptPlaceholder')"  :input-props="{ id: 'encryptionField0' }"/>
          <NInput v-model:value="encryptSecret" :placeholder="t('common.secretKeyPlaceholder')"  :input-props="{ id: 'encryptionField1' }"/>
          <NSelect v-model:value="encryptAlgo" :options="algoOptions" />
          <NInput :value="encryptOutput" readonly type="textarea" :rows="2" style="font-family: monospace;"  :input-props="{ id: 'encryptionField2' }"/>
          <NButton @click="copy">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>

      <NCard :title="t('common.decrypt')">
        <NSpace vertical :size="12">
          <NInput v-model:value="decryptInput" type="textarea" :rows="3" :placeholder="t('tools.encryption.decryptPlaceholder')"  :input-props="{ id: 'encryptionField3' }"/>
          <NInput v-model:value="decryptSecret" :placeholder="t('common.secretKeyPlaceholder')"  :input-props="{ id: 'encryptionField4' }"/>
          <NSelect v-model:value="decryptAlgo" :options="algoOptions" />
          <NAlert v-if="decryptError" type="error">{{ decryptError }}</NAlert>
          <NInput v-else-if="decryptOutput" :value="decryptOutput" readonly type="textarea" :rows="2" style="font-family: monospace;"  :input-props="{ id: 'encryptionField5' }"/>
          <NButton @click="doDecrypt">{{ t('common.decrypt') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
