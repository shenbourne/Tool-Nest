<script setup lang="ts">
import { computed, ref } from 'vue';
import { NAlert, NButton, NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
import { convertNumber, numberKinds, parseNumber, type NumberKind } from './number-converter.service';
const { t } = useI18n();
const { copyToClipboard } = useCopy();
const sourceKind = ref<NumberKind>('decimal');
const sourceText = ref('42');
const values = computed(() => convertNumber(sourceKind.value, sourceText.value));
const invalid = computed(() => sourceText.value.trim() !== '' && parseNumber(sourceKind.value, sourceText.value) === null);
const romanUnavailable = computed(() => !invalid.value && sourceText.value.trim() !== '' && values.value.roman === '');
function update(kind: NumberKind, text: string) {
  sourceKind.value = kind;
  sourceText.value = text;
}

</script>
<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="16">
        <div v-for="kind in numberKinds" :key="kind" class="number-row">
          <label :for="`numberConverter-${kind}`">{{ t(`tools.numberConverter.${kind}`) }}:</label>
          <NInput :value="sourceKind === kind ? sourceText : values[kind]" :status="sourceKind === kind && invalid ? 'error' : undefined" :input-props="{ id: `numberConverter-${kind}` }" :placeholder="t(`tools.numberConverter.${kind}`)" @update:value="update(kind, $event)" />
          <NButton :disabled="!(sourceKind === kind ? sourceText : values[kind])" @click="copyToClipboard(sourceKind === kind ? sourceText : values[kind])">{{ t('tool.copy') }}</NButton>
        </div>
        <NAlert v-if="invalid" type="error">{{ t('tools.numberConverter.invalid') }}</NAlert>
        <NAlert v-if="romanUnavailable" type="info">{{ t('tools.numberConverter.romanRange') }}</NAlert>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
<style scoped>
.number-row { display: grid; grid-template-columns: 180px minmax(0, 1fr) auto; align-items: center; gap: 12px; }
@media (max-width: 640px) { .number-row { grid-template-columns: minmax(0, 1fr) auto; } .number-row label { grid-column: 1 / -1; } }
</style>
