<script setup lang="ts">
import { ref, computed } from 'vue';
import { NButton, NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';

const { t } = useI18n();

const urls = ref('');
const loading = ref(false);
const error = ref('');
const result = ref<unknown>(null);

const resultText = computed(() => result.value ? JSON.stringify(result.value, null, 2) : '');

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
    <ToolTextPanel v-model:input-text="urls" :output-text="resultText" :input-title="t('common.input')" :output-title="t('common.output')" export-name="censorship-result.json" hide-input>
      <template #output>
        <NInput v-if="resultText" :value="resultText" type="textarea" :rows="10" readonly style="font-family: monospace;"  :input-props="{ id: 'censorshipCheckField1' }"/>
      </template>
      <template #params>
        <NButton type="primary" :loading="loading" :disabled="!urls.trim()" @click="run">{{ t('tools.censorshipCheck.check') }}</NButton>
        <NAlert v-if="error" type="error" :title="error" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
