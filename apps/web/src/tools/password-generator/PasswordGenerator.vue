<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NInputNumber, NSwitch, NButton, NInput } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const length = ref(16);
const upper = ref(true);
const lower = ref(true);
const nums = ref(true);
const syms = ref(true);
const exclude = ref('');
const pw = ref('');
function gen() {
  let chars = '';
  if (upper.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lower.value) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (nums.value) chars += '0123456789';
  if (syms.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (exclude.value) chars = chars.split('').filter(c => !exclude.value.includes(c)).join('');
  if (!chars) { pw.value = t('tools.passwordGenerator.selectOneOption'); return; }
  const arr = new Uint32Array(length.value);
  crypto.getRandomValues(arr);
  pw.value = Array.from(arr, v => chars[v % chars.length]).join('');
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NSpace align="center">
        <span>{{ t('common.length') }}:</span><NInputNumber v-model:value="length" :min="4" :max="128" style="width:100px" />
      </NSpace>
      <NSpace>
        <NSwitch v-model:value="upper">{{ t('common.uppercase') }}</NSwitch>
        <NSwitch v-model:value="lower">{{ t('common.lowercase') }}</NSwitch>
        <NSwitch v-model:value="nums">{{ t('common.numbers') }}</NSwitch>
        <NSwitch v-model:value="syms">{{ t('common.symbols') }}</NSwitch>
      </NSpace>
      <NInput v-model:value="exclude" :placeholder="t('tools.passwordGenerator.excludePlaceholder')" />
      <NButton type="primary" @click="gen">{{ t('tools.passwordGenerator.generatePassword') }}</NButton>
      <NInput :value="pw" readonly :placeholder="t('tools.passwordGenerator.outputPlaceholder')" />
    </NSpace></NCard>
  </ToolLayout>
</template>
