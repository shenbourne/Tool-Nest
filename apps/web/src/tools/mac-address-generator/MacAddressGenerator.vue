<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NInputNumber, NSelect, NSpace, NButton, NAlert, NRadioGroup, NRadio } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { generateMacAddresses, isValidMacPrefix } from './mac-address-generator.service';

const { t } = useI18n();
const tool = useCurrentTool();

const count = ref(5);
const prefix = ref('64:16:7F');
const separator = ref(':');
const uppercase = ref(true);

const separatorOptions = [
  { label: ':', value: ':' },
  { label: '-', value: '-' },
  { label: '.', value: '.' },
  { label: 'None', value: '' },
];

const prefixValid = computed(() => isValidMacPrefix(prefix.value));

const macAddresses = computed(() => {
  if (!prefixValid.value) return [];
  return generateMacAddresses(count.value, {
    prefix: prefix.value,
    separator: separator.value,
    uppercase: uppercase.value,
  });
});

function refresh() {
  // Force re-computation by bumping a dependency
  count.value = count.value;
}

function copyAll() {
  navigator.clipboard.writeText(macAddresses.value.join('\n'));
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Settings">
        <NSpace vertical :size="12">
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="min-width: 120px; text-align: right;">Quantity:</label>
            <NInputNumber v-model:value="count" :min="1" :max="100" style="flex: 1" />
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="min-width: 120px; text-align: right;">Prefix (OUI):</label>
            <NInput v-model:value="prefix" placeholder="e.g. 64:16:7F" clearable style="flex: 1" />
          </div>
          <NAlert v-if="prefix && !prefixValid" type="error">
            Invalid MAC prefix. Use hex pairs separated by : or -
          </NAlert>
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="min-width: 120px; text-align: right;">Separator:</label>
            <NSelect v-model:value="separator" :options="separatorOptions" style="flex: 1" />
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="min-width: 120px; text-align: right;">Case:</label>
            <NRadioGroup v-model:value="uppercase">
              <NRadio :value="true">Uppercase</NRadio>
              <NRadio :value="false">Lowercase</NRadio>
            </NRadioGroup>
          </div>
        </NSpace>
      </NCard>

      <NCard title="Generated MAC Addresses">
        <pre style="margin: 0; font-family: monospace; white-space: pre-wrap;">{{ macAddresses.join('\n') }}</pre>
        <NSpace style="margin-top: 12px" justify="center">
          <NButton @click="refresh">Refresh</NButton>
          <NButton @click="copyAll">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
