<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSelect, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool, hashText, hashAlgorithms, type HashAlgorithm } from './index';

const { t } = useI18n();

const inputText = ref('Lorem ipsum dolor sit amet');
const algorithm = ref<HashAlgorithm>('SHA256');
const output = computed(() => hashText(inputText.value, algorithm.value));

const algoOptions = Object.keys(hashAlgorithms).map(label => ({ label, value: label }));
</script>

<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="inputText" :output-text="output" :input-title="t('tools.hashText.name')" :output-title="t('common.output')" export-name="hash.txt">
      <template #input>
        <NInput v-model:value="inputText" type="textarea" :rows="3" :placeholder="t('tools.hashText.inputPlaceholder')"  :input-props="{ id: 'hashTextField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" readonly type="textarea" :rows="2" style="font-family: monospace;"  :input-props="{ id: 'hashTextField1' }"/>
      </template>
      <template #params>
        <NSpace>
          <NSelect v-model:value="algorithm" :options="algoOptions" style="min-width: 140px" />
        </NSpace>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
