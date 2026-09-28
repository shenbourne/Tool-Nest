<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NInputNumber, NButton, NSpace, NDataTable, NAlert, NDivider } from 'naive-ui';
import type { DataTableColumn } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { runBenchmark, type BenchmarkSuite, type BenchmarkResult } from './benchmark-builder.service';

const { t } = useI18n();
const tool = useCurrentTool();

const suites = ref<BenchmarkSuite[]>([
  { id: '1', name: t('tools.benchmarkBuilder.suite', { n: 1 }), code: 'let sum = 0;\nfor (let i = 0; i < 1000; i++) sum += i;\nreturn sum;' },
  { id: '2', name: t('tools.benchmarkBuilder.suite', { n: 2 }), code: 'let sum = 0;\nlet i = 0;\nwhile (i < 1000) { sum += i; i++; }\nreturn sum;' },
]);

const iterations = ref(100);
const isRunning = ref(false);
const results = ref<BenchmarkResult[]>([]);
const error = ref('');

let nextId = 3;

function addSuite() {
  suites.value.push({
    id: String(nextId++),
    name: t('tools.benchmarkBuilder.suite', { n: suites.value.length + 1 }),
    code: '',
  });
}

function removeSuite(id: string) {
  suites.value = suites.value.filter(s => s.id !== id);
}

async function run() {
  isRunning.value = true;
  error.value = '';
  results.value = [];
  try {
    // Runs in a Web Worker with a per-suite timeout, so a buggy (e.g. infinite
    // loop) suite no longer freezes the page.
    const { results: r, failures } = await runBenchmark(suites.value, iterations.value);
    results.value = r;
    if (failures.length > 0) {
      error.value = failures.map(f => `${f.suiteName}: ${f.message}`).join('\n');
    } else if (results.value.length === 0) {
      error.value = t('tools.benchmarkBuilder.noResults');
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('tools.benchmarkBuilder.failed');
  } finally {
    isRunning.value = false;
  }
}

function reset() {
  suites.value = [
    { id: '1', name: t('tools.benchmarkBuilder.suite', { n: 1 }), code: '' },
    { id: '2', name: t('tools.benchmarkBuilder.suite', { n: 2 }), code: '' },
  ];
  results.value = [];
  error.value = '';
}

const round = (v: number) => Math.round(v * 1000) / 1000;

const resultColumns = computed<DataTableColumn<BenchmarkResult>[]>(() => [
  { title: t('tools.benchmarkBuilder.suiteColumn'), key: 'suiteName' },
  { title: t('tools.benchmarkBuilder.iterations'), key: 'iterations', width: 100 },
  { title: t('tools.benchmarkBuilder.avgMs'), key: 'avgMs', width: 120, render: (row) => `${round(row.avgMs)}` },
  { title: t('tools.benchmarkBuilder.minMs'), key: 'minMs', width: 120, render: (row) => `${round(row.minMs)}` },
  { title: t('tools.benchmarkBuilder.maxMs'), key: 'maxMs', width: 120, render: (row) => `${round(row.maxMs)}` },
  { title: t('tools.benchmarkBuilder.opsPerSec'), key: 'opsPerSec', width: 120, render: (row) => `${round(row.opsPerSec)}` },
]);
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.benchmarkBuilder.suitesTitle')">
        <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px;">
          <div v-for="suite in suites" :key="suite.id" style="flex: 1; min-width: 300px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <NInput
                :value="suite.name"
                @update:value="(v: string) => suite.name = v"
                :placeholder="t('tools.benchmarkBuilder.suiteNamePlaceholder')"
                size="small"
                style="flex: 1;"
               :input-props="{ id: 'benchmarkBuilderField0' }"/>
              <NButton
                v-if="suites.length > 1"
                size="small"
                @click="removeSuite(suite.id)"
              >
                {{ t('tool.clear') }}
              </NButton>
            </div>
            <NInput
              :value="suite.code"
              @update:value="(v: string) => suite.code = v"
              type="textarea"
              :placeholder="t('tools.benchmarkBuilder.codePlaceholder')"
              :autosize="{ minRows: 5, maxRows: 15 }"
              style="font-family: monospace;"
             :input-props="{ id: 'benchmarkBuilderField1' }"/>
          </div>
        </div>

        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <NButton @click="addSuite">{{ t('tools.benchmarkBuilder.addSuite') }}</NButton>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label :for="'benchmarkBuilderField2'">{{ t('tools.benchmarkBuilder.iterations') }}:</label>
            <NInputNumber v-model:value="iterations" :min="1" :max="100000" style="width: 120px;"  :input-props="{ id: 'benchmarkBuilderField2' }"/>
          </div>
          <NButton type="primary" @click="run" :loading="isRunning">{{ t('tools.benchmarkBuilder.run') }}</NButton>
          <NButton @click="reset">{{ t('common.reset') }}</NButton>
        </div>
      </NCard>

      <NAlert v-if="error" type="error">{{ error }}</NAlert>

      <NCard v-if="results.length > 0" :title="t('common.results')">
        <NDataTable
          :columns="resultColumns"
          :data="results"
          :bordered="false"
          :single-line="false"
          size="small"
        />
      </NCard>

      <NDivider />

      <NCard :title="t('common.about')">
        <i18n-t keypath="tools.benchmarkBuilder.aboutText" tag="div" style="opacity: 0.8; line-height: 1.6;">
          <template #code><code>new Function()</code></template>
        </i18n-t>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
