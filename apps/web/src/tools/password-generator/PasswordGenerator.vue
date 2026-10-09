<script setup lang="ts">
import { ref } from 'vue';
import { NInputNumber, NSwitch, NButton, NInput, NAlert, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
const { t } = useI18n();
const length = ref(16);
const upper = ref(true);
const lower = ref(true);
const nums = ref(true);
const syms = ref(true);
const exclude = ref('');
const pw = ref('');
const error = ref('');
function gen() {
  error.value = '';
  let chars = '';
  if (upper.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lower.value) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (nums.value) chars += '0123456789';
  if (syms.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (exclude.value) chars = chars.split('').filter(c => !exclude.value.includes(c)).join('');
  if (!chars) { pw.value = ''; error.value = t('tools.passwordGenerator.selectOneOption'); return; }
  const arr = new Uint32Array(length.value);
  crypto.getRandomValues(arr);
  pw.value = Array.from(arr, v => chars[v % chars.length]).join('');
}
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel :input-text="''" :output-text="pw" :output-title="t('common.output')" export-name="password.txt" hide-input>
      <template #output>
        <NInput :value="pw" readonly :placeholder="t('tools.passwordGenerator.outputPlaceholder')"  :input-props="{ id: 'passwordGeneratorField2' }"/>
      </template>
      <template #params>
        <NSpace align="center">
          <span>{{ t('common.length') }}:</span><NInputNumber v-model:value="length" :min="4" :max="128" style="width:100px"  :input-props="{ id: 'passwordGeneratorField0' }"/>
        </NSpace>
        <NSpace>
          <NSwitch v-model:value="upper">{{ t('common.uppercase') }}</NSwitch>
          <NSwitch v-model:value="lower">{{ t('common.lowercase') }}</NSwitch>
          <NSwitch v-model:value="nums">{{ t('common.numbers') }}</NSwitch>
          <NSwitch v-model:value="syms">{{ t('common.symbols') }}</NSwitch>
        </NSpace>
        <NInput v-model:value="exclude" :placeholder="t('tools.passwordGenerator.excludePlaceholder')"  :input-props="{ id: 'passwordGeneratorField1' }"/>
        <NButton type="primary" @click="gen">{{ t('tools.passwordGenerator.generatePassword') }}</NButton>
        <NAlert v-if="error" type="error" :title="error" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
