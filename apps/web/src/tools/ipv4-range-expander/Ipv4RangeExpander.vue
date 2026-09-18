<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert, NButton, NDataTable } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { calculateCidr, type RangeExpanderResult } from './ipv4-range-expander.service';
import { isValidIpv4 } from '../ipv4-address-converter/ipv4-address-converter.service';

const { t } = useI18n();
const tool = useCurrentTool();

const startIp = ref('192.168.1.1');
const endIp = ref('192.168.6.255');

const startValid = computed(() => isValidIpv4(startIp.value));
const endValid = computed(() => isValidIpv4(endIp.value));

const result = computed<RangeExpanderResult | null>(() => {
  if (!startValid.value || !endValid.value) return null;
  return calculateCidr(startIp.value, endIp.value);
});

const isReversed = computed(() => {
  if (!startValid.value || !endValid.value) return false;
  return result.value === null;
});

const tableData = computed(() => {
  if (!result.value) return [];
  const r = result.value;
  return [
    { property: 'Start Address', oldValue: r.oldStart, newValue: r.newStart },
    { property: 'End Address', oldValue: r.oldEnd, newValue: r.newEnd },
    { property: 'Addresses in Range', oldValue: r.oldSize.toLocaleString(), newValue: r.newSize.toLocaleString() },
    { property: 'CIDR', oldValue: '', newValue: r.newCidr },
  ];
});

const columns = [
  { title: 'Property', key: 'property' },
  { title: 'Old Value', key: 'oldValue' },
  { title: 'New Value', key: 'newValue' },
];

function swapAddresses() {
  const tmp = startIp.value;
  startIp.value = endIp.value;
  endIp.value = tmp;
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="IP Range">
        <NSpace :size="12">
          <div style="flex: 1">
            <NInput v-model:value="startIp" placeholder="Start IPv4 address..." />
            <NAlert v-if="startIp && !startValid" type="error" style="margin-top: 4px">
              Invalid IPv4 address
            </NAlert>
          </div>
          <div style="flex: 1">
            <NInput v-model:value="endIp" placeholder="End IPv4 address..." />
            <NAlert v-if="endIp && !endValid" type="error" style="margin-top: 4px">
              Invalid IPv4 address
            </NAlert>
          </div>
        </NSpace>
      </NCard>

      <NCard v-if="result" title="CIDR Result">
        <NDataTable
          :columns="columns"
          :data="tableData"
          :bordered="true"
          :single-line="false"
          size="small"
        />
      </NCard>

      <NAlert v-else-if="isReversed" type="error" title="Invalid address combination">
        The end IPv4 address is lower than the start IPv4 address.
        <NButton size="small" style="margin-top: 8px" @click="swapAddresses">
          Switch start and end
        </NButton>
      </NAlert>
    </NSpace>
  </ToolLayout>
</template>
