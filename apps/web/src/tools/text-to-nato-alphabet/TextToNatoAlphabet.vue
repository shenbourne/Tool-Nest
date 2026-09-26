<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { textToNatoAlphabet } from './text-to-nato-alphabet.service';

const { t } = useI18n();
const tool = useCurrentTool();

const input = ref('');
const natoOutput = computed(() => textToNatoAlphabet(input.value));

function copyOutput() {
  if (natoOutput.value) navigator.clipboard.writeText(natoOutput.value);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('common.input')">
        <NInput v-model:value="input" type="textarea" :rows="4" :placeholder="t('tools.textToNatoAlphabet.inputPlaceholder')" />
      </NCard>
      <NCard :title="t('tools.textToNatoAlphabet.natoAlphabet')">
        <NInput :value="natoOutput" type="textarea" :rows="4" readonly :placeholder="t('tools.textToNatoAlphabet.outputPlaceholder')" />
      </NCard>
      <NButton type="primary" :disabled="!natoOutput" @click="copyOutput">{{ t('tool.copy') }}</NButton>
    </NSpace>
  </ToolLayout>
</template>
