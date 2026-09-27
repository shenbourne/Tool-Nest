<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSelect, NButton, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool, hashText, hashAlgorithms, type HashAlgorithm } from './index';

const { t } = useI18n();
const { copyToClipboard } = useCopy();

const inputText = ref('Lorem ipsum dolor sit amet');
const algorithm = ref<HashAlgorithm>('SHA256');
const output = computed(() => hashText(inputText.value, algorithm.value));

const algoOptions = Object.keys(hashAlgorithms).map(label => ({ label, value: label }));

function copy() { copyToClipboard(output.value); }
</script>

<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.hashText.name')">
        <NSpace vertical :size="12">
          <NInput v-model:value="inputText" type="textarea" :rows="3" :placeholder="t('tools.hashText.inputPlaceholder')" />
          <NSelect v-model:value="algorithm" :options="algoOptions" />
          <NInput :value="output" readonly type="textarea" :rows="2" style="font-family: monospace;" />
          <NButton @click="copy">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
