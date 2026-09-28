<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NInput, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { evaluateExpression } from './generic-calculator.service';
import { tool } from './index';

const { t } = useI18n();

const expr = ref('');
const result = ref('');
const history = ref<string[]>([]);
function calc() {
  try {
    const value = evaluateExpression(expr.value);
    if (!Number.isFinite(value)) {
      result.value = t('tools.genericCalculator.errorPrefix', { message: t('tools.genericCalculator.notFinite') });
      return;
    }
    result.value = String(value);
    history.value.unshift(expr.value + ' = ' + result.value);
    if (history.value.length > 10) history.value.pop();
  }
  catch (e: any) { result.value = t('tools.genericCalculator.errorPrefix', { message: e.message }); }
}
</script>
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="expr" :placeholder="t('tools.genericCalculator.expressionPlaceholder', { example: '2+3*4' })" @keyup.enter="calc"  :input-props="{ id: 'genericCalculatorField0' }"/>
      <NButton type="primary" @click="calc">{{ t('common.calculate') }}</NButton>
      <NInput :value="result" readonly :placeholder="t('tools.genericCalculator.resultPlaceholder')"  :input-props="{ id: 'genericCalculatorField1' }"/>
      <div v-if="history.length" style="opacity:0.7;font-size:13px;">{{ t('tools.genericCalculator.history') }}<br/><span v-for="h in history">{{ h }}<br/></span></div>
    </NSpace></NCard>
  </ToolLayout>
</template>
