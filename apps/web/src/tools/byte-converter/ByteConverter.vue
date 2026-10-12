<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NInputNumber, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
import { byteUnits, convertByteUnit, type ByteUnit } from './byte-converter.service';

const { t } = useI18n();

const sourceValue = ref<number | null>(1024);
const sourceUnit = ref<ByteUnit>('Bytes');

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
    <NCard><NSpace vertical :size="12">
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
