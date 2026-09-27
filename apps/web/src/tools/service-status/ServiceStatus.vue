<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NButton, NInput, NDataTable } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const url = ref('https://example.com');
const results = ref<{check: string; status: string; time: string}[]>([]);
const loading = ref(false);

// A no-cors fetch returns an opaque response for ANY HTTP status, so a service
// answering 404/500 used to be reported as reachable. Probe with CORS first to
// see the real status, and only fall back to opaque reachability when the
// browser blocks reading the response.
async function probe(u: string): Promise<{ kind: 'ok' | 'error-status' | 'opaque'; status?: number }> {
  try {
    const r = await fetch(u, { mode: 'cors', cache: 'no-store' });
    return { kind: r.ok ? 'ok' : 'error-status', status: r.status };
  } catch {
    await fetch(u, { mode: 'no-cors', cache: 'no-store' });
    return { kind: 'opaque' };
  }
}

async function check() {
  loading.value = true; results.value = [];
  const start = Date.now();
  try {
    const probeResult = await probe(url.value);
    const elapsed = Date.now() - start;
    const httpStatus = probeResult.kind === 'ok'
      ? t('tools.serviceStatus.reachable')
      : probeResult.kind === 'error-status'
        ? t('tools.serviceStatus.errorStatus', { code: probeResult.status })
        : t('tools.serviceStatus.statusUnknown');
    results.value = [
      { check: t('tools.serviceStatus.httpRequest'), status: httpStatus, time: elapsed + 'ms' },
      { check: t('tools.serviceStatus.responseTime'), status: elapsed < 500 ? t('tools.serviceStatus.fast') : elapsed < 2000 ? t('tools.serviceStatus.moderate') : t('tools.serviceStatus.slow'), time: elapsed + 'ms' },
      { check: t('tools.serviceStatus.sslTls'), status: url.value.startsWith('https') ? '✅ HTTPS' : t('tools.serviceStatus.httpOnly'), time: '' },
    ];
  } catch {
    results.value = [{ check: t('tools.serviceStatus.httpRequest'), status: t('tools.serviceStatus.unreachable'), time: '-' }];
  }
  loading.value = false;
}
const cols = computed(() => [{ title: t('tools.serviceStatus.checkColumn'), key: 'check' }, { title: t('common.status'), key: 'status' }, { title: t('tools.serviceStatus.timeColumn'), key: 'time' }]);
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="url" :placeholder="t('tools.serviceStatus.inputPlaceholder')" style="width:300px" />
      <NButton type="primary" :loading="loading" @click="check">{{ t('tools.serviceStatus.checkStatus') }}</NButton>
      <NDataTable v-if="results.length" :columns="cols" :data="results" :bordered="false" size="small" />
    </NSpace></NCard>
  </ToolLayout>
</template>
