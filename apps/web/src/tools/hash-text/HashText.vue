<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool, hashText, hashAlgorithms, type HashAlgorithm } from './index';
import ToolStringResults from '@/components/ToolStringResults.vue';

const { t } = useI18n();

const inputText = ref('Lorem ipsum dolor sit amet');
const results = computed(() => (Object.keys(hashAlgorithms) as HashAlgorithm[]).map(label => ({
  label, value: hashText(inputText.value, label),
})));
</script>

<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="inputText" :output-text="results[0].value" :input-title="t('common.input')" hide-output>
      <template #input>
        <NInput v-model:value="inputText" :placeholder="t('tools.hashText.inputPlaceholder')" :input-props="{ id: 'hashTextField0' }" />
      </template>
      <template #params>
        <ToolStringResults :results="results" id-prefix="hash-text-result" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
