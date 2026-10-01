<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { convertMorse, unmappableChars } from './morse-code.service';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const output = computed(() => convertMorse(input.value));
// Characters silently dropped from the encoding are surfaced, not swallowed.
const unmappable = computed(() => unmappableChars(input.value));
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'morseCodeField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'morseCodeField1' }"/>
      </template>
      <template #params>
        <NAlert v-if="unmappable.length" type="warning" :title="t('tools.morseCode.unmappable', { chars: unmappable.join(' ') })" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
