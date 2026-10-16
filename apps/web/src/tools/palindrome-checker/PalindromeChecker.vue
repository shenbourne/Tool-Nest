<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import ToolTabs from '@/components/ToolTabs.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const mode = ref('check');
const clean = computed(() => input.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
const output = computed(() => {
  if (mode.value === 'create') {
    return input.value + input.value.split('').reverse().join('');
  }
  const c = clean.value;
  if (!c) return '';
  const rev = c.split('').reverse().join('');
  return c === rev ? t('tools.palindromeChecker.isPalindrome') : t('tools.palindromeChecker.notPalindrome');
});
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTabs v-model:value="mode" :tabs="[{ name: 'check', label: t('tools.palindromeChecker.checkTab') }, { name: 'create', label: t('tools.palindromeChecker.createTab') }]" :aria-label="t(tool.name)">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt" stack-on-mobile wrap-actions>
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'palindromeCheckerField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'palindromeCheckerField1' }"/>
      </template>
    </ToolTextPanel>
    </ToolTabs>
  </ToolLayout>
</template>
