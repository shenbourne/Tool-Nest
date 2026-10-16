<script setup lang="ts">
import { ref, computed } from 'vue';
import { NButton, NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
import NetworkResults from '@/components/NetworkResults.vue';

const { t } = useI18n();

const urls = ref('');
const loading = ref(false);
const error = ref('');
const result = ref<unknown>(null);

const resultText = computed(() => result.value ? JSON.stringify(result.value, null, 2) : '');

async function run() {
  if (loading.value) return;
  loading.value = true;
  error.value = '';
  result.value = null;
  const urlList = urls.value.split('\n').map(u => u.trim()).filter(Boolean);
  if (!urlList.length) {
    error.value = t('tools.censorshipCheck.emptyError');
    loading.value = false;
    return;
  }
  try {
    const res = await fetch('/api/network/censorship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: urlList }),
    });
    if (res.status === 429) throw new Error(t('networkResults.rateLimited'));
    const json = await res.json().catch(() => { throw new Error(t('networkResults.invalidResponse')); });
    if (!json.success) {
      const code = json.error?.code;
      const known = ['VALIDATION_ERROR', 'OONI_UNAVAILABLE', 'OONI_TIMEOUT', 'OONI_INVALID_RESPONSE'];
      throw new Error(known.includes(code) ? t(`tools.censorshipCheck.errors.${code}`) : t('common.requestFailed'));
    }
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
    <ToolTextPanel v-model:input-text="urls" :output-text="resultText" :input-title="t('common.input')" :output-title="t('common.output')" export-name="censorship-result.json" hide-input>
      <template #output>
        <NetworkResults v-if="result" :data="result" kind="censorship" />
      </template>
      <template #params>
        <NInput v-model:value="urls" type="textarea" :rows="3" :placeholder="t('networkResults.urlsPlaceholder')" :disabled="loading" :input-props="{ id: 'censorshipCheckField0' }" />
        <NButton type="primary" :loading="loading" :disabled="!urls.trim()" @click="run">{{ t('tools.censorshipCheck.check') }}</NButton>
        <NAlert v-if="error" type="error" :title="error" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
