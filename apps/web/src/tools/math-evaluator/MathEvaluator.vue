<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { parseMath } from './math-evaluator.service';
import { tool } from './index';

const { t } = useI18n();

const expr = ref('2 * (3 + 4) ^ 2');
const exprError = computed(() => {
  if (!expr.value.trim()) return '';
  try { parseMath(expr.value); return ''; } catch (e: any) { return e.message; }
});
const result = computed(() => {
  if (!expr.value.trim() || exprError.value) return '';
  return String(parseMath(expr.value));
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="expr" :placeholder="t('tools.mathEvaluator.expressionPlaceholder')" size="large"  :input-props="{ id: 'mathEvaluatorField0' }"/>
      <NAlert v-if="exprError" type="error" :title="exprError" />
      <div style="font-size: 24px; font-weight: 700; text-align: center; padding: 16px;">{{ result }}</div>
      <NAlert type="info" :title="t('tools.mathEvaluator.supportedOperators')">{{ t('tools.mathEvaluator.operatorsList') }}</NAlert>
    </NSpace></NCard>
  </ToolLayout>
</template>
