<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSelect, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { convertBase } from './base-converter.service';
import { tool } from './index';

const { t } = useI18n();

const inputBase = ref(10);
const outputBase = ref(16);
const inputValue = ref('255');

const bases = computed(() => [
  { label: t('tools.baseConverter.binary'), value: 2 }, { label: t('tools.baseConverter.octal'), value: 8 },
  { label: t('tools.baseConverter.decimal'), value: 10 }, { label: t('tools.baseConverter.hexadecimal'), value: 16 },
  { label: t('tools.baseConverter.base32'), value: 32 }, { label: t('tools.baseConverter.base36'), value: 36 },
]);

const output = computed(() => convertBase(inputValue.value, inputBase.value, outputBase.value));
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="12">
        <div style="display: flex; gap: 12px;">
          <NSelect v-model:value="inputBase" :options="bases" :label="t('tools.baseConverter.inputBase')" style="flex:1;" />
          <NSelect v-model:value="outputBase" :options="bases" :label="t('tools.baseConverter.outputBase')" style="flex:1;" />
        </div>
        <NInput v-model:value="inputValue" :placeholder="t('tools.baseConverter.inputPlaceholder')"  :input-props="{ id: 'baseConverterField0' }"/>
        <NInput :value="output" readonly :placeholder="t('tools.baseConverter.resultPlaceholder')"  :input-props="{ id: 'baseConverterField1' }"/>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
