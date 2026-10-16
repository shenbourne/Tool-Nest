<script setup lang="ts">
import { ref, computed } from 'vue';
import { NButton, NInput, NSlider, NSelect, NSpace, NFormItem } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('my-secret-password-123');
const method = ref<'mask' | 'redact' | 'partial'>('mask');
const methodOptions = computed(() => [
  { label: t('tools.stringObfuscator.maskAll'), value: 'mask' },
  { label: t('tools.stringObfuscator.redact'), value: 'redact' },
  { label: t('tools.stringObfuscator.partial'), value: 'partial' },
]);
const keepChars = ref(3);
const maskChar = ref('*');
const output = computed(() => {
  const s = input.value;
  if (!s) return '';
  if (method.value === 'mask') return s.replace(/./g, maskChar.value);
  if (method.value === 'redact') return '[REDACTED]';
  const keep = Math.min(keepChars.value, Math.floor(s.length / 2));
  return s.slice(0, keep) + maskChar.value.repeat(s.length - keep * 2) + s.slice(-keep);
});
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt" stack-on-mobile wrap-actions>
      <template #input>
        <NInput v-model:value="input" type="textarea" :autosize="{ minRows: 6, maxRows: 20 }" :placeholder="t('tools.stringObfuscator.inputPlaceholder')" :input-props="{ id: 'stringObfuscatorField0' }" />
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :autosize="{ minRows: 6, maxRows: 20 }" readonly :input-props="{ id: 'stringObfuscatorField1' }" />
      </template>
      <template #params>
        <NSpace vertical :size="12">
          <NButton @click="input = ''">{{ t('tool.clear') }}</NButton>
          <NSelect v-model:value="method" :options="methodOptions" style="min-width: 220px" />
          <NFormItem v-if="method === 'partial'" :label="t('tools.stringObfuscator.keepCharacters')" label-placement="left">
            <NSlider v-model:value="keepChars" :min="1" :max="10" style="flex:1;" />
          </NFormItem>
        </NSpace>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
