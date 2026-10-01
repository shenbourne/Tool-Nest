<script setup lang="ts">
import { NInput, NSpace, NButton, NRadioGroup, NRadio, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { ref, computed, watch } from 'vue';

const { t } = useI18n();
const tool = useCurrentTool();

const mode = ref<'encode' | 'decode'>('encode');
const input = ref('');
const error = ref('');

const output = computed(() => {
  if (!input.value) return '';
  try {
    if (mode.value === 'encode') return btoa(unescape(encodeURIComponent(input.value)));
    return decodeURIComponent(escape(atob(input.value)));
  } catch (e: any) {
    error.value = e.message;
    return '';
  }
});

watch(input, () => { error.value = ''; });
watch(mode, () => { error.value = ''; });

function swap() {
  const prev = output.value;
  // Swapping an empty result (e.g. an invalid decode) would wipe the user's
  // original input, so refuse instead.
  if (!prev) { error.value = t('tools.base64Encoder.nothingToSwap'); return; }
  error.value = '';
  mode.value = mode.value === 'encode' ? 'decode' : 'encode';
  input.value = prev;
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="mode === 'encode' ? t('tools.base64Encoder.encodePlaceholder') : t('tools.base64Encoder.decodePlaceholder')"  :input-props="{ id: 'base64EncoderField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly  :input-props="{ id: 'base64EncoderField1' }"/>
      </template>
      <template #params>
        <NSpace align="center">
          <NRadioGroup v-model:value="mode">
            <NRadio name="base64EncoderMode" value="encode">{{ t('common.encode') }}</NRadio>
            <NRadio name="base64EncoderMode" value="decode">{{ t('common.decode') }}</NRadio>
          </NRadioGroup>
          <NButton @click="swap">⇄ {{ t('common.swap') }}</NButton>
          <NButton @click="input = ''">{{ t('tool.clear') }}</NButton>
        </NSpace>
        <NAlert v-if="error" type="error" :title="error" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
