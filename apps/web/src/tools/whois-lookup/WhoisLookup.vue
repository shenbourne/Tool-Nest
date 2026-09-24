<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const domain = ref('example.com');
const result = ref('');
const loading = ref(false);
async function lookup() {
  loading.value = true; result.value = '';
  try {
    const r = await fetch('https://rdap.org/domain/' + encodeURIComponent(domain.value));
    const j = await r.json();
    const events = (j.events || []).map((e: any) => e.eventAction + ': ' + e.eventDate).join('\n');
    const name = (j.ldhName || domain.value);
    const status = (j.status || []).join(', ');
    const registrar = (j.entities || []).find((e: any) => (e.roles || []).includes('registrar'));
    const regName = registrar ? (registrar.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3] || t('tools.whoisLookup.unknown')) : t('tools.whoisLookup.unknown');
    result.value = t('tools.whoisLookup.domainLine', { value: name }) + '\n' + t('tools.whoisLookup.registrarLine', { value: regName }) + '\n' + t('tools.whoisLookup.statusLine', { value: status }) + '\n' + t('tools.whoisLookup.events') + '\n' + events;
  } catch (e: any) { result.value = t('tools.whoisLookup.error', { message: e.message }); }
  loading.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NSpace><NInput v-model:value="domain" :placeholder="t('common.domainNamePlaceholder')" style="width:220px" /></NSpace>
      <NButton type="primary" :loading="loading" @click="lookup">{{ t('tools.whoisLookup.lookup') }}</NButton>
      <NInput v-if="result" :value="result" type="textarea" :rows="10" readonly />
    </NSpace></NCard>
  </ToolLayout>
</template>
