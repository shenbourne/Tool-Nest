<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInputNumber, NSpace, NDataTable } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const bytes = ref(1024);
const UNITS = ['Bytes','KB','MB','GB','TB','PB','Bits'];
const FACTORS = [1, 1024, 1024**2, 1024**3, 1024**4, 1024**5, 1/8];
const rows = computed(() => UNITS.map((u,i) => ({ unit: u, value: (bytes.value / FACTORS[i]).toLocaleString(undefined, {maximumFractionDigits: 4}) })));
const cols = [{ title: 'Unit', key: 'unit' }, { title: 'Value', key: 'value' }];
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInputNumber v-model:value="bytes" :min="0" placeholder="Enter bytes..." style="width:200px" />
      <NDataTable :columns="cols" :data="rows" :bordered="false" size="small" />
    </NSpace></NCard>
  </ToolLayout>
</template>
