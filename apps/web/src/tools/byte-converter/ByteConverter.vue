<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NInputNumber, NSelect, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
import { byteUnits, convertBase, convertByteUnit, type ByteUnit } from './byte-converter.service';

const { t } = useI18n();

const sourceValue = ref<number | null>(1024);
const sourceUnit = ref<ByteUnit>('Bytes');

const inputBase = ref(10);
const outputBase = ref(16);
const inputValue = ref('255');

const bases = computed(() => [
  { label: t('tools.byteConverter.binary'), value: 2 }, { label: t('tools.byteConverter.octal'), value: 8 },
  { label: t('tools.byteConverter.decimal'), value: 10 }, { label: t('tools.byteConverter.hexadecimal'), value: 16 },
  { label: t('tools.byteConverter.base32'), value: 32 }, { label: t('tools.byteConverter.base36'), value: 36 },
]);

const baseOutput = computed(() => convertBase(inputValue.value, inputBase.value, outputBase.value));

function updateValue(unit: ByteUnit, value: number | null) {
  sourceUnit.value = unit;
  sourceValue.value = value;
}

function unitLabel(unit: ByteUnit) {
  if (unit === 'Bytes') return t('numericParams.bytes');
  if (unit === 'Bits') return t('tools.byteConverter.bits');
  return unit;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.byteConverter.byteSection')"><NSpace vertical :size="12">
        <div v-for="unit in byteUnits" :key="unit.id" class="byte-unit-row">
          <label :for="`byteConverter-${unit.id}`">{{ unitLabel(unit.id) }}:</label>
          <NInputNumber
            :value="convertByteUnit(sourceValue, sourceUnit, unit.id)"
            :min="0"
            :input-props="{ id: `byteConverter-${unit.id}` }"
            @update:value="updateValue(unit.id, $event)"
          />
        </div>
      </NSpace></NCard>
      <NCard :title="t('tools.byteConverter.baseSection')">
        <NSpace vertical :size="12">
          <div style="display: flex; gap: 12px;">
            <NSelect v-model:value="inputBase" :options="bases" :label="t('tools.byteConverter.inputBase')" style="flex:1;" />
            <NSelect v-model:value="outputBase" :options="bases" :label="t('tools.byteConverter.outputBase')" style="flex:1;" />
          </div>
          <NInput v-model:value="inputValue" :placeholder="t('tools.byteConverter.baseInputPlaceholder')" :input-props="{ id: 'byteConverterBaseInput' }" />
          <NInput :value="baseOutput" readonly :placeholder="t('tools.byteConverter.resultPlaceholder')" :input-props="{ id: 'byteConverterBaseOutput' }" />
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>

<style scoped>
.byte-unit-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.byte-unit-row > label {
  color: var(--color-ink);
}

.byte-unit-row > .n-input-number {
  width: 100%;
  min-width: 0;
}
</style>
