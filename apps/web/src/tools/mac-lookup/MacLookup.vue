<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInput, NAlert } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const mac = ref('');
const vendor = ref('');
const loading = ref(false);
const error = ref('');
async function lookup() {
  loading.value = true; vendor.value = ''; error.value = '';
  const prefix = mac.value.replace(/[:-]/g, '').slice(0, 6).toUpperCase();
  if (prefix.length < 6) { error.value = 'Enter a valid MAC address'; loading.value = false; return; }
  try {
    const r = await fetch('https://api.maclookup.app/v2/macs/' + prefix);
    const j = await r.json();
    vendor.value = j.company || j.found ? 'Found' : 'Not found';
    if (j.company) vendor.value = j.company;
  } catch (e: any) { error.value = e.message; }
  loading.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="mac" placeholder="MAC address (e.g. 00:1A:2B:3C:4D:5E)" style="width:300px" />
      <NButton type="primary" :loading="loading" @click="lookup">Lookup Vendor</NButton>
      <NAlert v-if="vendor" type="success" :title="'Vendor: ' + vendor" />
      <NAlert v-if="error" type="error" :title="error" />
    </NSpace></NCard>
  </ToolLayout>
</template>
