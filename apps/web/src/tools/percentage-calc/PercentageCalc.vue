<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInputNumber, NSpace, NDivider } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const a = ref(10); const b = ref(200); // What is a% of b?
const c = ref(50); const d = ref(100); // c is what % of d?
const e = ref(80); const f = ref(100); // % change from e to f
// Cleared inputs are null; show nothing rather than a fake "0.0000".
const result1 = computed(() => (a.value == null || b.value == null) ? '' : (a.value / 100 * b.value).toFixed(4));
const result2 = computed(() => (c.value == null || d.value == null) ? '' : d.value ? (c.value / d.value * 100).toFixed(4) : '0');
const result3 = computed(() => (e.value == null || f.value == null) ? '' : e.value ? ((f.value - e.value) / e.value * 100).toFixed(4) : '0');
</script>
<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.percentageCalc.whatIsPercentOf')"><NSpace align="center">
        <NInputNumber v-model:value="a" :show-button="false" style="width:100px;" />
        <span>{{ t('tools.percentageCalc.percentOf') }}</span>
        <NInputNumber v-model:value="b" :show-button="false" style="width:120px;" />
        <span>= <strong>{{ result1 }}</strong></span>
      </NSpace></NCard>
      <NCard :title="t('tools.percentageCalc.isWhatPercentOf')"><NSpace align="center">
        <NInputNumber v-model:value="c" :show-button="false" style="width:100px;" />
        <span>{{ t('tools.percentageCalc.is') }}</span>
        <NInputNumber v-model:value="d" :show-button="false" style="width:120px;" />
        <span>= <strong>{{ result2 }}%</strong></span>
      </NSpace></NCard>
      <NCard :title="t('tools.percentageCalc.percentChangeFromTo')"><NSpace align="center">
        <NInputNumber v-model:value="e" :show-button="false" style="width:100px;" />
        <span>→</span>
        <NInputNumber v-model:value="f" :show-button="false" style="width:120px;" />
        <span>= <strong>{{ result3 }}%</strong></span>
      </NSpace></NCard>
    </NSpace>
  </ToolLayout>
</template>
