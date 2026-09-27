<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
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
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')" />
      <NAlert v-if="unmappable.length" type="warning" :title="t('tools.morseCode.unmappable', { chars: unmappable.join(' ') })" />
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')" />
    </NSpace></NCard>
  </ToolLayout>
</template>
