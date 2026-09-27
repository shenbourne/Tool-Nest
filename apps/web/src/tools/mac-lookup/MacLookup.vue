<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const mac = ref('');
const vendor = ref('');
const loading = ref(false);
const error = ref('');
async function lookup() {
  loading.value = true; vendor.value = ''; error.value = '';
  // Accept the common Cisco dotted form (6416.7F00.0001) alongside colon and
  // hyphen separators, then require a valid hex prefix before calling the API.
  const prefix = mac.value.replace(/[.:\-]/g, '').slice(0, 6).toUpperCase();
  if (!/^[0-9A-F]{6}$/.test(prefix)) { error.value = t('tools.macLookup.invalidMac'); loading.value = false; return; }
  try {
    const r = await fetch('https://api.maclookup.app/v2/macs/' + prefix);
    const j = await r.json();
    vendor.value = j.company || j.found ? t('tools.macLookup.found') : t('tools.macLookup.notFound');
    if (j.company) vendor.value = j.company;
  } catch (e: any) { error.value = e.message; }
  loading.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="mac" :placeholder="t('tools.macLookup.inputPlaceholder')" style="width:300px" />
      <NButton type="primary" :loading="loading" @click="lookup">{{ t('tools.macLookup.lookup') }}</NButton>
      <NAlert v-if="vendor" type="success" :title="t('tools.macLookup.vendorResult', { vendor })" />
      <NAlert v-if="error" type="error" :title="error" />
    </NSpace></NCard>
  </ToolLayout>
</template>
