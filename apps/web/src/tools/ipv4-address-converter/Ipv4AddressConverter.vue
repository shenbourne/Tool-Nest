<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { convertIpv4, isValidIpv4 } from './ipv4-address-converter.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const ipInput = ref('192.168.1.1');
const isValid = computed(() => isValidIpv4(ipInput.value));
const result = computed(() => {
  if (!isValid.value) return null;
  return convertIpv4(ipInput.value);
});

const sections = computed(() => {
  if (!result.value) return [];
  return [
    { label: 'Decimal', value: result.value.decimal },
    { label: 'Binary (dotted)', value: result.value.binary },
    { label: 'Hexadecimal (dotted)', value: result.value.hex },
    { label: 'Octal (dotted)', value: result.value.octal },
    { label: 'Integer', value: result.value.integer },
    { label: 'IPv6', value: result.value.ipv6 },
    { label: 'IPv6 (short)', value: result.value.ipv6Short },
  ];
});

function copyValue(value: string) {
  copyToClipboard(value);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="IPv4 Address">
        <NInput
          v-model:value="ipInput"
          placeholder="e.g. 192.168.1.1"
         :input-props="{ id: 'ipv4AddressConverterField0' }"/>
        <NAlert v-if="ipInput && !isValid" type="error" style="margin-top: 8px">
          Invalid IPv4 address
        </NAlert>
      </NCard>

      <NCard v-if="result">
        <NSpace vertical :size="8">
          <div v-for="section in sections" :key="section.label" class="format-row">
            <span class="format-label">{{ section.label }}:</span>
            <span class="format-value">{{ section.value }}</span>
            <button class="copy-btn" @click="copyValue(section.value)">{{ t('tool.copy') }}</button>
          </div>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>

<style scoped>
.format-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
}
.format-label {
  min-width: 140px;
  font-weight: 600;
  text-align: right;
}
.format-value {
  flex: 1;
  font-family: monospace;
  word-break: break-all;
}
.copy-btn {
  cursor: pointer;
  padding: 2px 8px;
  border: 1px solid var(--color-hairline);
  border-radius: 4px;
  background: transparent;
  font-size: 12px;
  white-space: nowrap;
}
.copy-btn:hover {
  background: var(--color-surface-2);
}
</style>
