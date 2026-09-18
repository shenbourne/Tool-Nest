<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NDataTable, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { parseCidr, isValidCidr } from './ipv4-subnet-calculator.service';

const { t } = useI18n();
const tool = useCurrentTool();

const cidrInput = ref('192.168.0.1/24');

const isValid = computed(() => isValidCidr(cidrInput.value));
const result = computed(() => {
  if (!isValid.value) return null;
  return parseCidr(cidrInput.value);
});

const tableData = computed(() => {
  if (!result.value) return [];
  const r = result.value;
  return [
    { property: 'Network Address', value: r.networkAddress },
    { property: 'Broadcast Address', value: r.broadcastAddress },
    { property: 'Subnet Mask', value: r.subnetMask },
    { property: 'Wildcard Mask', value: r.wildcardMask },
    { property: 'CIDR Prefix', value: `/${r.cidr}` },
    { property: 'Mask (Binary)', value: r.maskBinary },
    { property: 'First Host', value: r.firstHost },
    { property: 'Last Host', value: r.lastHost },
    { property: 'Total Hosts', value: r.totalHosts.toLocaleString() },
    { property: 'Usable Hosts', value: r.usableHosts.toLocaleString() },
    { property: 'IP Class', value: r.ipClass },
  ];
});

const columns = [
  { title: 'Property', key: 'property' },
  { title: 'Value', key: 'value' },
];
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="IPv4 CIDR Address">
        <NInput
          v-model:value="cidrInput"
          placeholder="e.g. 192.168.1.0/24"
        />
        <NAlert v-if="cidrInput && !isValid" type="error" style="margin-top: 8px">
          Invalid IPv4 CIDR address. Use format like 192.168.1.0/24
        </NAlert>
      </NCard>

      <NCard v-if="result" title="Subnet Details">
        <NDataTable
          :columns="columns"
          :data="tableData"
          :bordered="true"
          :single-line="false"
          size="small"
        />
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
