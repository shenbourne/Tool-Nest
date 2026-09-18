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
  { id: '1', name: 'Suite 1', code: 'let sum = 0;\nfor (let i = 0; i < 1000; i++) sum += i;\nreturn sum;' },
  { id: '2', name: 'Suite 2', code: 'let sum = 0;\nlet i = 0;\nwhile (i < 1000) { sum += i; i++; }\nreturn sum;' },
]);

const iterations = ref(100);
const isRunning = ref(false);
const results = ref<BenchmarkResult[]>([]);
const error = ref('');

let nextId = 3;

function addSuite() {
  suites.value.push({
    id: String(nextId++),
    name: `Suite ${suites.value.length + 1}`,
    code: '',
  });
}

function removeSuite(id: string) {
  suites.value = suites.value.filter(s => s.id !== id);
}

function run() {
  isRunning.value = true;
  error.value = '';
  results.value = [];

  setTimeout(() => {
    try {
      results.value = runBenchmark(suites.value, iterations.value);
      if (results.value.length === 0) {
        error.value = 'No suites produced results. Check your code for errors.';
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Benchmark failed';
    } finally {
      isRunning.value = false;
    }
  }, 50);
}

function reset() {
  suites.value = [
    { id: '1', name: 'Suite 1', code: '' },
    { id: '2', name: 'Suite 2', code: '' },
  ];
  results.value = [];
  error.value = '';
}

const round = (v: number) => Math.round(v * 1000) / 1000;

const resultColumns: DataTableColumn<BenchmarkResult>[] = [
  { title: 'Suite', key: 'suiteName' },
  { title: 'Iterations', key: 'iterations', width: 100 },
  { title: 'Avg (ms)', key: 'avgMs', width: 120, render: (row) => `${round(row.avgMs)}` },
  { title: 'Min (ms)', key: 'minMs', width: 120, render: (row) => `${round(row.minMs)}` },
  { title: 'Max (ms)', key: 'maxMs', width: 120, render: (row) => `${round(row.maxMs)}` },
  { title: 'Ops/sec', key: 'opsPerSec', width: 120, render: (row) => `${round(row.opsPerSec)}` },
];
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Benchmark Suites">
        <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px;">
          <div v-for="(suite, index) in suites" :key="suite.id" style="flex: 1; min-width: 300px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <NInput
                :value="suite.name"
                @update:value="(v: string) => suite.name = v"
                placeholder="Suite name"
                size="small"
                style="flex: 1;"
              />
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
              placeholder="// JavaScript code to benchmark"
              :autosize="{ minRows: 5, maxRows: 15 }"
              style="font-family: monospace;"
            />
          </div>
        </div>

        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <NButton @click="addSuite">+ Add Suite</NButton>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label>Iterations:</label>
            <NInputNumber v-model:value="iterations" :min="1" :max="100000" style="width: 120px;" />
          </div>
          <NButton type="primary" @click="run" :loading="isRunning">Run Benchmark</NButton>
          <NButton @click="reset">Reset</NButton>
        </div>
      </NCard>

      <NAlert v-if="error" type="error">{{ error }}</NAlert>

      <NCard v-if="results.length > 0" title="Results">
        <NDataTable
          :columns="resultColumns"
          :data="results"
          :bordered="false"
          :single-line="false"
          size="small"
        />
      </NCard>

      <NDivider />

      <NCard title="About">
        <div style="opacity: 0.8; line-height: 1.6;">
          Write JavaScript code in each suite and run benchmarks to compare execution speed.
          Results show average, min, max execution time and operations per second across all iterations.
          Code runs via <code>new Function()</code> with a warmup pass before measured iterations.
        </div>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
