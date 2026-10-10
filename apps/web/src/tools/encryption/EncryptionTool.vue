<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSelect, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { AES, RC4, Rabbit, TripleDES, enc } from 'crypto-js';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
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

// Decryption runs automatically like encryption: any change to the input,
// algorithm or secret key recomputes the plaintext immediately.
const decryptResult = computed(() => {
  if (!decryptInput.value) return { output: '', error: '' };
  try {
    const text = algos[decryptAlgo.value].decrypt(decryptInput.value, decryptSecret.value).toString(enc.Utf8);
    return { output: text, error: '' };
  } catch {
    return { output: '', error: t('tools.encryption.decryptFailed') };
  }
});
const decryptOutput = computed(() => decryptResult.value.output);
const decryptError = computed(() => decryptResult.value.error);
</script>

<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <ToolTextPanel v-model:input-text="encryptInput" :output-text="encryptOutput" :input-title="t('common.encrypt')" :output-title="t('common.output')" export-name="encrypted.txt">
        <template #input>
          <NInput v-model:value="encryptInput" type="textarea" :rows="3" :placeholder="t('tools.encryption.encryptPlaceholder')"  :input-props="{ id: 'encryptionField0' }"/>
        </template>
        <template #output>
          <NInput :value="encryptOutput" readonly type="textarea" :rows="2" style="font-family: monospace;"  :input-props="{ id: 'encryptionField2' }"/>
        </template>
        <template #params>
          <NSpace>
            <NInput v-model:value="encryptSecret" :placeholder="t('common.secretKeyPlaceholder')"  :input-props="{ id: 'encryptionField1' }"/>
            <NSelect v-model:value="encryptAlgo" :options="algoOptions" style="min-width: 120px" />
          </NSpace>
        </template>
      </ToolTextPanel>

      <ToolTextPanel v-model:input-text="decryptInput" :output-text="decryptOutput" :input-title="t('common.decrypt')" :output-title="t('common.output')" export-name="decrypted.txt">
        <template #input>
          <NInput v-model:value="decryptInput" type="textarea" :rows="3" :placeholder="t('tools.encryption.decryptPlaceholder')"  :input-props="{ id: 'encryptionField3' }"/>
        </template>
        <template #output>
          <NInput :value="decryptOutput" readonly type="textarea" :rows="2" style="font-family: monospace;"  :input-props="{ id: 'encryptionField5' }"/>
        </template>
        <template #params>
          <NSpace>
            <NInput v-model:value="decryptSecret" :placeholder="t('common.secretKeyPlaceholder')"  :input-props="{ id: 'encryptionField4' }"/>
            <NSelect v-model:value="decryptAlgo" :options="algoOptions" style="min-width: 120px" />
          </NSpace>
          <NAlert v-if="decryptError" type="error">{{ decryptError }}</NAlert>
        </template>
      </ToolTextPanel>
    </NSpace>
  </ToolLayout>
</template>
