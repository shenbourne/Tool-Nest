<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NInput, NAlert, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
import { PingRequestError, requestPing } from './ping.service';

const { t } = useI18n();

const target = ref('');
const loading = ref(false);
const error = ref('');
interface PingMeasurement {
  target: string;
  results?: {
    probe?: { city?: string; country?: string; network?: string; asn?: number };
    result?: {
      status?: string;
      resolvedAddress?: string;
      rawOutput?: string;
      stats?: { min?: number; avg?: number; max?: number; loss?: number; total?: number; rcv?: number; drop?: number };
    };
  }[];
}

const result = ref<PingMeasurement | null>(null);

function formatNumber(value?: number): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(Math.round(value * 100) / 100) : '—';
}

function probeState(probeResult?: NonNullable<PingMeasurement['results']>[number]['result']) {
  if (probeResult?.status !== 'finished') return 'failed';
  const loss = probeResult.stats?.loss;
  if (loss === undefined) return 'completed';
  return loss >= 100 ? 'unreachable' : loss > 0 ? 'packetLoss' : 'reachable';
}

async function run() {
  if (loading.value || !target.value.trim()) return;
  loading.value = true;
  error.value = '';
  result.value = null;
  try {
    result.value = await requestPing(target.value) as PingMeasurement;
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
        <section v-if="result" class="ping-results" aria-live="polite">
          <div class="result-heading">
            <h2>{{ result.target }}</h2>
            <span>{{ t('tools.pingTest.results.probeCount', { count: result.results?.length ?? 0 }) }}</span>
          </div>
          <p class="result-note">{{ t('tools.pingTest.results.remoteNote') }}</p>
          <p v-if="!result.results?.length">{{ t('tools.pingTest.results.noResults') }}</p>
          <NCard v-for="(entry, index) in result.results" :key="index" size="small" class="probe-card">
            <div class="probe-heading">
              <div>
                <h3>{{ [entry.probe?.city, entry.probe?.country].filter(Boolean).join(', ') || t('tools.pingTest.results.probe', { index: index + 1 }) }}</h3>
                <div class="probe-network">{{ entry.probe?.network }} <span v-if="entry.probe?.asn">· AS{{ entry.probe.asn }}</span></div>
              </div>
              <NTag :type="probeState(entry.result) === 'reachable' ? 'success' : probeState(entry.result) === 'packetLoss' ? 'warning' : probeState(entry.result) === 'completed' ? 'default' : 'error'" size="small" round>
                {{ t(`tools.pingTest.results.${probeState(entry.result)}`) }}
              </NTag>
            </div>
            <dl class="ping-metrics">
              <div class="metric metric-primary">
                <dt>{{ t('tools.pingTest.results.average') }}</dt>
                <dd>{{ formatNumber(entry.result?.stats?.avg) }} <small>ms</small></dd>
              </div>
              <div class="metric">
                <dt>{{ t('tools.pingTest.results.minimum') }}</dt>
                <dd>{{ formatNumber(entry.result?.stats?.min) }} <small>ms</small></dd>
              </div>
              <div class="metric">
                <dt>{{ t('tools.pingTest.results.maximum') }}</dt>
                <dd>{{ formatNumber(entry.result?.stats?.max) }} <small>ms</small></dd>
              </div>
              <div class="metric" :class="{ 'metric-loss': (entry.result?.stats?.loss ?? 0) > 0 }">
                <dt>{{ t('tools.pingTest.results.loss') }}</dt>
                <dd>{{ formatNumber(entry.result?.stats?.loss) }} <small>%</small></dd>
              </div>
            </dl>
            <div class="probe-footer">
              <span>{{ t('tools.pingTest.results.address') }}: <code>{{ entry.result?.resolvedAddress || '—' }}</code></span>
              <span>{{ t('tools.pingTest.results.packets', { sent: formatNumber(entry.result?.stats?.total), received: formatNumber(entry.result?.stats?.rcv), lost: formatNumber(entry.result?.stats?.drop) }) }}</span>
            </div>
            <details v-if="entry.result?.rawOutput" class="ping-details">
              <summary>{{ t('tools.pingTest.results.rawOutput') }}</summary>
              <pre>{{ entry.result.rawOutput }}</pre>
            </details>
          </NCard>
          <details class="ping-details">
            <summary>{{ t('tools.pingTest.results.rawData') }}</summary>
            <pre>{{ JSON.stringify(result, null, 2) }}</pre>
          </details>
        </section>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>

<style scoped>
.ping-results { min-width: 0; }
.result-heading, .probe-heading, .probe-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.result-heading h2 { margin: 0; font-size: 20px; overflow-wrap: anywhere; }
.result-heading > span, .result-note, .probe-network, .probe-footer, .metric dt { color: var(--color-text-2); }
.result-note { margin: 6px 0 16px; font-size: 13px; }
.probe-card { margin-bottom: 12px; }
.probe-heading h3 { margin: 0; font-size: 16px; }
.probe-network { font-size: 12px; overflow-wrap: anywhere; }
.ping-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin: 20px 0; }
.metric dt { font-size: 12px; }
.metric dd { margin: 4px 0 0; font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; }
.metric dd small { font-size: 12px; font-weight: 400; }
.metric-primary dd { color: var(--color-primary); }
.metric-loss dd { color: #d97706; }
.probe-footer { font-size: 12px; overflow-wrap: anywhere; }
.ping-details { margin-top: 12px; font-size: 13px; }
.ping-details summary { cursor: pointer; padding: 4px 0; }
.ping-details pre { margin: 8px 0 0; max-height: 320px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 12px; }
@media (max-width: 640px) {
  .ping-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .metric dd { font-size: 21px; }
}
</style>
