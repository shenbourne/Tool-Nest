<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
import { PingRequestError, requestPing } from './ping.service';

const { t } = useI18n();

const target = ref('');
const loading = ref(false);
const error = ref('');
const result = ref<unknown>(null);

async function run() {
  if (loading.value || !target.value.trim()) return;
  loading.value = true;
  error.value = '';
  result.value = null;
  try {
    result.value = await requestPing(target.value);
  } catch (e: unknown) {
    error.value = e instanceof PingRequestError
      ? t(`tools.pingTest.errors.${e.code}`)
      : e instanceof Error ? e.message : t('common.requestFailed');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="12">
        <NInput v-model:value="target" :placeholder="t('common.enterDomainOrIp')" @keyup.enter="run"  :input-props="{ id: 'pingTestField0' }"/>
        <NButton type="primary" :loading="loading" :disabled="loading || !target.trim()" @click="run">{{ t('tools.pingTest.ping') }}</NButton>
        <NAlert v-if="error" type="error" :title="error" />
        <pre v-if="result">{{ JSON.stringify(result, null, 2) }}</pre>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
