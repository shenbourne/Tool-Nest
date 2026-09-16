<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { NLayout, NLayoutHeader, NLayoutContent, NCard, NAlert, NSpin, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import AppNavbar from '@/components/AppNavbar.vue';
import type { ShareReport } from '@toolnest/shared';

const route = useRoute();
const { t } = useI18n();

const report = ref<ShareReport | null>(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  const id = route.params.id as string;
  try {
    const res = await fetch(`/api/reports/${id}`);
    if (!res.ok) {
      error.value = t('report.expired');
      return;
    }
    const json = await res.json();
    if (json.success && json.data) {
      report.value = json.data;
    } else {
      error.value = t('report.expired');
    }
  } catch {
    error.value = t('report.expired');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <NLayout style="min-height: 100vh;">
    <NLayoutHeader>
      <AppNavbar />
    </NLayoutHeader>
    <NLayoutContent content-style="padding: 24px; max-width: 800px; margin: 0 auto;">
      <NSpin v-if="loading" style="display: flex; justify-content: center; padding: 48px;" />

      <NAlert v-else-if="error" type="warning" :title="t('report.expired')" style="margin-top: 24px;" />

      <div v-else-if="report">
        <h1 style="margin: 0 0 8px;">{{ report.title || t('report.title') }}</h1>
        <NTag size="small" style="margin-bottom: 16px;">
          {{ t('report.createdAt') }}: {{ new Date(report.createdAt).toLocaleString() }}
        </NTag>
        <NCard>
          <pre style="white-space: pre-wrap; word-break: break-word; margin: 0; font-family: monospace; font-size: 14px; line-height: 1.6;">{{ report.content }}</pre>
        </NCard>
      </div>
    </NLayoutContent>
  </NLayout>
</template>
