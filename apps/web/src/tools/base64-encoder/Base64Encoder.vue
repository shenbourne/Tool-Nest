<script setup lang="ts">
import { NInput, NSpace, NAlert, NDivider } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { ref, computed } from 'vue';

const { t } = useI18n();

// --- 文本 → Base64 ---
const encodeInput = ref('');

const encodeResult = computed(() => {
  if (!encodeInput.value) return { output: '', error: '' };
  try { return { output: btoa(unescape(encodeURIComponent(encodeInput.value))), error: '' }; }
  catch { return { output: '', error: t('tools.base64Encoder.invalidText') }; }
});
const encodeOutput = computed(() => encodeResult.value.output);
const encodeError = computed(() => encodeResult.value.error);

// --- Base64 → 文本 ---
const decodeInput = ref('');

const decodeResult = computed(() => {
  if (!decodeInput.value) return { output: '', error: '' };
  try { return { output: decodeURIComponent(escape(atob(decodeInput.value))), error: '' }; }
  catch { return { output: '', error: t('tools.base64Encoder.invalidBase64') }; }
});
const decodeOutput = computed(() => decodeResult.value.output);
const decodeError = computed(() => decodeResult.value.error);
</script>

<template>
  <NSpace vertical :size="12" class="base64-encoder">
    <ToolTextPanel v-model:input-text="encodeInput" :output-text="encodeOutput" :input-title="t('tools.base64Encoder.textToBase64')" :output-title="t('common.output')" export-name="base64.txt" stack-on-mobile>
      <template #input>
        <NInput v-model:value="encodeInput" type="textarea" :rows="6" :placeholder="t('tools.base64Encoder.encodePlaceholder')" :input-props="{ id: 'base64EncoderField0' }" />
      </template>
      <template #output>
        <NInput :value="encodeOutput" type="textarea" :rows="6" readonly :input-props="{ id: 'base64EncoderField1' }" />
      </template>
      <template #params>
        <NAlert v-if="encodeError" type="error" :title="encodeError" />
      </template>
    </ToolTextPanel>

    <NDivider style="margin: 0 0 12px 0;" />

    <ToolTextPanel v-model:input-text="decodeInput" :output-text="decodeOutput" :input-title="t('tools.base64Encoder.base64ToText')" :output-title="t('common.output')" export-name="output.txt" stack-on-mobile>
      <template #input>
        <NInput v-model:value="decodeInput" type="textarea" :rows="6" :placeholder="t('tools.base64Encoder.decodePlaceholder')" :input-props="{ id: 'base64EncoderField2' }" />
      </template>
      <template #output>
        <NInput :value="decodeOutput" type="textarea" :rows="6" readonly :input-props="{ id: 'base64EncoderField3' }" />
      </template>
      <template #params>
        <NAlert v-if="decodeError" type="error" :title="decodeError" />
      </template>
    </ToolTextPanel>
  </NSpace>
</template>
