<script setup lang="ts">
import { NCard, NInput, NSpace, NButton, NRadioGroup, NRadio } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
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

function copyOutput() {
  if (output.value) navigator.clipboard.writeText(output.value);
}

function swap() {
  const prev = output.value;
  mode.value = mode.value === 'encode' ? 'decode' : 'encode';
  input.value = prev;
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NSpace align="center">
        <NRadioGroup v-model:value="mode">
          <NRadio value="encode">{{ t('common.encode') }}</NRadio>
          <NRadio value="decode">{{ t('common.decode') }}</NRadio>
        </NRadioGroup>
        <NButton @click="swap">⇄ {{ t('common.swap') }}</NButton>
        <NButton @click="input = ''">{{ t('tool.clear') }}</NButton>
        <NButton type="primary" @click="copyOutput" :disabled="!output">{{ t('tool.copy') }}</NButton>
      </NSpace>
      <NCard v-if="error" :bordered="false" style="background: var(--color-error-soft);">
        <span style="color: var(--color-error);">{{ error }}</span>
      </NCard>
      <NCard :title="t('common.input')">
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="mode === 'encode' ? t('tools.base64Encoder.encodePlaceholder') : t('tools.base64Encoder.decodePlaceholder')" />
      </NCard>
      <NCard :title="t('common.output')">
        <NInput :value="output" type="textarea" :rows="6" readonly />
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
