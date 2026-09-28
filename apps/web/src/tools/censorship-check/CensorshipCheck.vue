<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const urls = ref('');
const loading = ref(false);
const error = ref('');
const result = ref<unknown>(null);

async function run() {
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
        <NInput
          v-model:value="urls"
          type="textarea"
          :placeholder="t('tools.censorshipCheck.inputPlaceholder')"
          :rows="4"
         :input-props="{ id: 'censorshipCheckField0' }"/>
        <NButton type="primary" :loading="loading" :disabled="!urls.trim()" @click="run">{{ t('tools.censorshipCheck.check') }}</NButton>
        <NAlert v-if="error" type="error" :title="error" />
        <pre v-if="result">{{ JSON.stringify(result, null, 2) }}</pre>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
