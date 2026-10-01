<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSpace, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
const start = ref(0);
const end = ref(10);
const output = computed(() => input.value.slice(start.value, end.value));
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="4" :placeholder="t('tools.extractSubstring.inputPlaceholder')"  :input-props="{ id: 'extractSubstringField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="3" readonly  :input-props="{ id: 'extractSubstringField3' }"/>
      </template>
      <template #params>
        <NSpace><NInputNumber v-model:value="start" :min="0" :placeholder="t('common.start')" style="width:120px"  :input-props="{ id: 'extractSubstringField1' }"/><NInputNumber v-model:value="end" :min="0" :placeholder="t('common.end')" style="width:120px"  :input-props="{ id: 'extractSubstringField2' }"/></NSpace>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
