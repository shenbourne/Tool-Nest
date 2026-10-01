<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { textToNatoAlphabet } from './text-to-nato-alphabet.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const input = ref('');
const natoOutput = computed(() => textToNatoAlphabet(input.value));

function copyOutput() {
  if (natoOutput.value) copyToClipboard(natoOutput.value);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="natoOutput" :input-title="t('common.input')" :output-title="t('tools.textToNatoAlphabet.natoAlphabet')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="4" :placeholder="t('tools.textToNatoAlphabet.inputPlaceholder')"  :input-props="{ id: 'textToNatoAlphabetField0' }"/>
      </template>
      <template #output>
        <NInput :value="natoOutput" type="textarea" :rows="4" readonly :placeholder="t('tools.textToNatoAlphabet.outputPlaceholder')"  :input-props="{ id: 'textToNatoAlphabetField1' }"/>
      </template>
      <template #params>
        <NButton type="primary" :disabled="!natoOutput" @click="copyOutput">{{ t('tool.copy') }}</NButton>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
