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
    { property: t('tools.ipv4SubnetCalculator.networkAddress'), value: r.networkAddress },
    { property: t('tools.ipv4SubnetCalculator.broadcastAddress'), value: r.broadcastAddress },
    { property: t('tools.ipv4SubnetCalculator.subnetMask'), value: r.subnetMask },
    { property: t('tools.ipv4SubnetCalculator.wildcardMask'), value: r.wildcardMask },
    { property: t('tools.ipv4SubnetCalculator.cidrPrefix'), value: `/${r.cidr}` },
    { property: t('tools.ipv4SubnetCalculator.maskBinary'), value: r.maskBinary },
    { property: t('tools.ipv4SubnetCalculator.firstHost'), value: r.firstHost },
    { property: t('tools.ipv4SubnetCalculator.lastHost'), value: r.lastHost },
    { property: t('tools.ipv4SubnetCalculator.totalHosts'), value: r.totalHosts.toLocaleString() },
    { property: t('tools.ipv4SubnetCalculator.usableHosts'), value: r.usableHosts.toLocaleString() },
    { property: t('tools.ipv4SubnetCalculator.ipClass'), value: r.ipClass },
  ];
});

const columns = computed(() => [
  { title: t('tools.ipv4SubnetCalculator.property'), key: 'property' },
  { title: t('tools.ipv4SubnetCalculator.value'), key: 'value' },
]);
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.ipv4SubnetCalculator.ipv4CidrAddress')">
        <NInput
          v-model:value="cidrInput"
          :placeholder="t('tools.ipv4SubnetCalculator.cidrPlaceholder')"
         :input-props="{ id: 'ipv4SubnetCalculatorField0' }"/>
        <NAlert v-if="cidrInput && !isValid" type="error" style="margin-top: 8px">
          {{ t('tools.ipv4SubnetCalculator.invalidCidr') }}
        </NAlert>
      </NCard>

      <NCard v-if="result" :title="t('tools.ipv4SubnetCalculator.subnetDetails')">
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
