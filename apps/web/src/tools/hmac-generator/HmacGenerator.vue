<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSelect, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { HmacMD5, HmacRIPEMD160, HmacSHA1, HmacSHA224, HmacSHA256, HmacSHA3, HmacSHA384, HmacSHA512, enc } from 'crypto-js';
import type { lib } from 'crypto-js';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
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
</script>

<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="plainText" :output-text="hmac" :input-title="t('common.input')" :output-title="t('common.output')" export-name="hmac.txt">
      <template #input>
        <NInput v-model:value="plainText" type="textarea" :rows="3" :placeholder="t('tools.hmacGenerator.inputPlaceholder')"  :input-props="{ id: 'hmacGeneratorField0' }"/>
      </template>
      <template #output>
        <NInput :value="hmac" readonly type="textarea" :rows="2" style="font-family: monospace;"  :input-props="{ id: 'hmacGeneratorField2' }"/>
      </template>
      <template #params>
        <NInput v-model:value="secret" :placeholder="t('common.secretKeyPlaceholder')"  :input-props="{ id: 'hmacGeneratorField1' }"/>
        <div style="display: flex; gap: 12px;">
          <NSelect v-model:value="hashFunction" :options="Object.keys(algos).map(l => ({ label: l, value: l }))" :label="t('tools.hmacGenerator.hashFunction')" style="flex: 1;" />
          <NSelect v-model:value="encoding" :options="encodingOptions" :label="t('tools.hmacGenerator.encoding')" style="flex: 1;" />
        </div>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
