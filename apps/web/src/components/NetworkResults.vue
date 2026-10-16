<script setup lang="ts">
import { computed } from 'vue';
import { NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { buildNetworkGroups, type NetworkResultKind } from './network-results';
const props = defineProps<{ data: unknown; kind: NetworkResultKind }>();
const { t } = useI18n();
const groups = computed(() => buildNetworkGroups(props.data, props.kind, key => t(key)));
const note = computed(() => props.kind === 'mtr' ? 'mtrNote' : props.kind === 'latency' ? 'latencyNote' : props.kind === 'dns-leak' ? 'dnsLeakNote' : props.kind === 'censorship' ? 'censorshipNote' : '');
</script>

<template>
  <section class="network-results" aria-live="polite">
    <p v-if="note" class="result-note">{{ t(`networkResults.${note}`) }}</p>
    <p v-if="!groups.length">{{ t('networkResults.noResults') }}</p>
    <article v-for="(group, index) in groups" :key="index" class="result-card">
      <header>
        <div><h3>{{ group.title }}</h3><p v-if="group.subtitle" class="result-note">{{ group.subtitle }}</p></div>
        <NTag v-if="group.state" :type="group.tone" round size="small">{{ group.state }}</NTag>
      </header>
      <dl v-if="group.fields?.length" class="result-fields">
        <div v-for="field in group.fields" :key="field.label"><dt>{{ field.label }}</dt><dd>{{ field.value }}</dd></div>
      </dl>
      <div v-if="group.rows?.length" class="result-table" role="region" :aria-label="group.title" tabindex="0">
        <table>
          <thead><tr><th v-for="(column, i) in group.columns" :key="i" scope="col">{{ column }}</th></tr></thead>
          <tbody><tr v-for="(row, i) in group.rows" :key="i"><td v-for="(cell, j) in row" :key="j">{{ cell }}</td></tr></tbody>
        </table>
      </div>
      <p v-else-if="group.columns" class="result-note">{{ t('networkResults.noRecords') }}</p>
      <details v-if="group.log"><summary>{{ t('networkResults.log') }}</summary><pre>{{ group.log }}</pre></details>
    </article>
    <details><summary>{{ t('networkResults.rawData') }}</summary><pre>{{ JSON.stringify(data, null, 2) }}</pre></details>
  </section>
</template>

<style scoped>
.network-results { min-width: 0; width: 100%; }
.result-note { color: var(--color-text-2); font-size: 13px; margin: 4px 0 12px; }
.result-card { border: 1px solid var(--color-hairline); border-radius: 8px; padding: 16px; margin: 12px 0; background: var(--color-surface); }
header { display: flex; gap: 12px; justify-content: space-between; align-items: center; flex-wrap: wrap; }
h3 { margin: 0; font-size: 16px; overflow-wrap: anywhere; }
.result-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr)); gap: 16px; margin: 16px 0; }
dt { color: var(--color-text-2); font-size: 12px; }
dd { margin: 4px 0 0; font-weight: 600; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.result-table { overflow-x: auto; margin-top: 12px; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
th, td { padding: 10px 12px; border-bottom: 1px solid var(--color-hairline); vertical-align: top; }
th { white-space: nowrap; background: var(--color-surface-soft); font-weight: 600; }
td { overflow-wrap: anywhere; min-width: 60px; font-variant-numeric: tabular-nums; }
details { margin-top: 12px; font-size: 13px; }
summary { cursor: pointer; padding: 4px 0; }
pre { max-height: 320px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 12px; }
</style>
