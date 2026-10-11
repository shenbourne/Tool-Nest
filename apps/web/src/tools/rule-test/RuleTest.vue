<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
import NetworkResults from '@/components/NetworkResults.vue';

const { t } = useI18n();

const domain = ref('');
const dnsServer = ref('');
const loading = ref(false);
const error = ref('');
const result = ref<unknown>(null);

async function run() {
  if (loading.value || !domain.value.trim()) return;
  loading.value = true;
  error.value = '';
  result.value = null;
  try {
    const body: Record<string, string> = { domain: domain.value };
    if (dnsServer.value) body.dnsServer = dnsServer.value;
    const res = await fetch('/api/network/rule-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 429) throw new Error(t('networkResults.rateLimited'));
    const json = await res.json().catch(() => { throw new Error(t('networkResults.invalidResponse')); });
    if (!json.success) throw new Error(json.error?.message ?? t('common.requestFailed'));
    result.value = json.data;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('common.requestFailed');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="12">
        <NInput v-model:value="domain" :placeholder="t('common.enterDomain')" @keyup.enter="run"  :input-props="{ id: 'ruleTestField0' }"/>
        <NInput v-model:value="dnsServer" :placeholder="t('tools.ruleTest.dnsServerPlaceholder')"  :input-props="{ id: 'ruleTestField1' }"/>
        <NButton type="primary" :loading="loading" :disabled="loading || !domain.trim()" @click="run">{{ t('tools.ruleTest.test') }}</NButton>
        <NAlert v-if="error" type="error" :title="error" />
        <NetworkResults v-if="result" :data="result" kind="rule" />
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
