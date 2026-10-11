<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
import NetworkResults from '@/components/NetworkResults.vue';

const { t } = useI18n();
const domain = ref('example.com');
const result = ref('');
const resultData = ref<unknown>(null);
const loading = ref(false);
async function lookup() {
  if (loading.value || !domain.value.trim()) return;
  resultData.value = null;
  loading.value = true; result.value = '';
  try {
    const r = await fetch('https://rdap.org/domain/' + encodeURIComponent(domain.value));
    // rdap.org answers unknown domains with a 404 JSON error body; without a
    // status check that body renders as a plausible-looking "result".
    if (!r.ok) {
      result.value = r.status === 404
        ? t('tools.whoisLookup.notFound', { domain: domain.value })
        : t('tools.whoisLookup.error', { message: `HTTP ${r.status}` });
      return;
    }
    const j = await r.json();
    resultData.value = j;
    const events = (j.events || []).map((e: any) => e.eventAction + ': ' + e.eventDate).join('\n');
    const name = (j.ldhName || domain.value);
    const status = (j.status || []).join(', ');
    const registrar = (j.entities || []).find((e: any) => (e.roles || []).includes('registrar'));
    const regName = registrar ? (registrar.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3] || t('tools.whoisLookup.unknown')) : t('tools.whoisLookup.unknown');
    result.value = t('tools.whoisLookup.domainLine', { value: name }) + '\n' + t('tools.whoisLookup.registrarLine', { value: regName }) + '\n' + t('tools.whoisLookup.statusLine', { value: status }) + '\n' + t('tools.whoisLookup.events') + '\n' + events;
  } catch (e: any) { result.value = t('tools.whoisLookup.error', { message: e.message }); }
  finally { loading.value = false; }
}
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="domain" :output-text="result" :input-title="t('common.domainNamePlaceholder')" :output-title="t('common.output')" export-name="whois-result.txt" hide-input>
      <template #output>
        <NetworkResults v-if="resultData" :data="resultData" kind="whois" />
        <NInput v-else-if="result" :value="result" type="textarea" :rows="10" readonly  :input-props="{ id: 'whoisLookupField1' }"/>
      </template>
      <template #params>
        <NSpace><NInput v-model:value="domain" :placeholder="t('common.domainNamePlaceholder')" style="width:220px" @keyup.enter="lookup"  :input-props="{ id: 'whoisLookupField0' }"/></NSpace>
        <NButton type="primary" :loading="loading" @click="lookup">{{ t('tools.whoisLookup.lookup') }}</NButton>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
