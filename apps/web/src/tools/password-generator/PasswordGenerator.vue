<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NInputNumber, NSwitch, NButton, NInput } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
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
  if (!chars) { pw.value = 'Select at least one option'; return; }
  const arr = new Uint32Array(length.value);
  crypto.getRandomValues(arr);
  pw.value = Array.from(arr, v => chars[v % chars.length]).join('');
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NSpace align="center">
        <span>Length:</span><NInputNumber v-model:value="length" :min="4" :max="128" style="width:100px" />
      </NSpace>
      <NSpace>
        <NSwitch v-model:value="upper">Uppercase</NSwitch>
        <NSwitch v-model:value="lower">Lowercase</NSwitch>
        <NSwitch v-model:value="nums">Numbers</NSwitch>
        <NSwitch v-model:value="syms">Symbols</NSwitch>
      </NSpace>
      <NInput v-model:value="exclude" placeholder="Exclude characters..." />
      <NButton type="primary" @click="gen">Generate Password</NButton>
      <NInput :value="pw" readonly placeholder="Click generate..." />
    </NSpace></NCard>
  </ToolLayout>
</template>
