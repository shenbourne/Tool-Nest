<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const target = ref('');
const loading = ref(false);
const error = ref('');
const result = ref<unknown>(null);

async function run() {
  loading.value = true;
  error.value = '';
  result.value = null;
  try {
    const res = await fetch('/api/network/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: target.value }),
    });
    const json = await res.json();
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
        <NInput v-model:value="target" :placeholder="t('common.enterDomainOrIp')" />
        <NButton type="primary" :loading="loading" :disabled="!target" @click="run">{{ t('tools.pingTest.ping') }}</NButton>
        <NAlert v-if="error" type="error" :title="error" />
        <pre v-if="result">{{ JSON.stringify(result, null, 2) }}</pre>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
