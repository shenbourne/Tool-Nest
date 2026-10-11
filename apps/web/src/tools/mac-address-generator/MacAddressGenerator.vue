<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NInputNumber, NSelect, NSpace, NButton, NAlert, NRadioGroup, NRadio } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { generateMacAddresses, isValidMacPrefix } from './mac-address-generator.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const count = ref(5);
const prefix = ref('64:16:7F');
const separator = ref(':');
const uppercase = ref(true);

const separatorOptions = computed(() => [
  { label: ':', value: ':' },
  { label: '-', value: '-' },
  { label: '.', value: '.' },
  { label: t('common.none'), value: '' },
]);

const prefixValid = computed(() => isValidMacPrefix(prefix.value));

// nonce lets the refresh button force regeneration instead of the old no-op
// `count.value = count.value`.
const nonce = ref(0);
const macAddresses = computed(() => {
  void nonce.value;
  if (!prefixValid.value) return [];
  return generateMacAddresses(count.value, {
    prefix: prefix.value,
    separator: separator.value,
    uppercase: uppercase.value,
  });
});

function refresh() {
  nonce.value++;
}

function copyAll() {
  copyToClipboard(macAddresses.value.join('\n'));
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('common.settings')">
        <NSpace vertical :size="12">
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="min-width: 120px; text-align: right;" :for="'macAddressGeneratorField0'">{{ t('common.quantity') }}:</label>
            <NInputNumber v-model:value="count" :min="1" :max="100" style="flex: 1"  :input-props="{ id: 'macAddressGeneratorField0' }"/>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="min-width: 120px; text-align: right;" :for="'macAddressGeneratorField1'">{{ t('tools.macAddressGenerator.prefixOui') }}:</label>
            <NInput v-model:value="prefix" :placeholder="t('tools.macAddressGenerator.prefixPlaceholder')" clearable style="flex: 1"  :input-props="{ id: 'macAddressGeneratorField1' }"/>
          </div>
          <NAlert v-if="prefix && !prefixValid" type="error">
            {{ t('tools.macAddressGenerator.invalidMacPrefix') }}
          </NAlert>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="min-width: 120px; text-align: right;">{{ t('common.separator') }}:</span>
            <NSelect v-model:value="separator" :options="separatorOptions" style="flex: 1" />
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="min-width: 120px; text-align: right;">{{ t('tools.macAddressGenerator.caseLabel') }}:</span>
            <NRadioGroup v-model:value="uppercase">
              <NRadio name="macAddressCase" :value="true">{{ t('common.uppercase') }}</NRadio>
              <NRadio name="macAddressCase" :value="false">{{ t('common.lowercase') }}</NRadio>
            </NRadioGroup>
          </div>
        </NSpace>
      </NCard>

      <NCard :title="t('tools.macAddressGenerator.generatedMacAddresses')">
        <pre style="margin: 0; font-family: monospace; white-space: pre-wrap;">{{ macAddresses.join('\n') }}</pre>
        <NSpace style="margin-top: 12px" justify="center">
          <NButton type="primary" @click="refresh">{{ t('common.generationActions.macAddresses') }}</NButton>
          <NButton @click="copyAll">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
