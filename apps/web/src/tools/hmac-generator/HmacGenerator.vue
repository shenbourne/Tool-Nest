<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSelect, NButton, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { HmacMD5, HmacRIPEMD160, HmacSHA1, HmacSHA224, HmacSHA256, HmacSHA3, HmacSHA384, HmacSHA512, enc } from 'crypto-js';
import type { lib } from 'crypto-js';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const algos = { MD5: HmacMD5, RIPEMD160: HmacRIPEMD160, SHA1: HmacSHA1, SHA3: HmacSHA3, SHA224: HmacSHA224, SHA256: HmacSHA256, SHA384: HmacSHA384, SHA512: HmacSHA512 } as const;
type Algo = keyof typeof algos;
type Encoding = 'Hex' | 'Base64' | 'Base64url';

const plainText = ref('');
const secret = ref('');
const hashFunction = ref<Algo>('SHA256');
const encoding = ref<Encoding>('Hex');

const encodingOptions = [
  { label: 'Hexadecimal (base 16)', value: 'Hex' },
  { label: 'Base64 (base 64)', value: 'Base64' },
  { label: 'Base64-url (base 64 url safe)', value: 'Base64url' },
];

const hmac = computed(() => {
  const result = algos[hashFunction.value](plainText.value, secret.value);
  return result.toString(enc[encoding.value]);
});

function copy() { navigator.clipboard.writeText(hmac.value); }
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="12">
        <NInput v-model:value="plainText" type="textarea" :rows="3" placeholder="Plain text to compute HMAC..." />
        <NInput v-model:value="secret" placeholder="Secret key..." />
        <div style="display: flex; gap: 12px;">
          <NSelect v-model:value="hashFunction" :options="Object.keys(algos).map(l => ({ label: l, value: l }))" label="Hash function" style="flex: 1;" />
          <NSelect v-model:value="encoding" :options="encodingOptions" label="Encoding" style="flex: 1;" />
        </div>
        <NInput :value="hmac" readonly type="textarea" :rows="2" style="font-family: monospace;" />
        <NButton @click="copy">{{ t('tool.copy') }}</NButton>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
