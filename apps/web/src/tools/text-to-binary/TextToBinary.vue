<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { convertTextToAsciiBinary, convertAsciiBinaryToText } from './text-to-binary.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const inputText = ref('');
const binaryFromText = computed(() => inputText.value ? convertTextToAsciiBinary(inputText.value) : '');

const inputBinary = ref('');
// Surface a decode failure as a message instead of only tinting the border,
// so an invalid payload is not mistaken for an empty result.
const binaryError = computed(() => {
  if (!inputBinary.value) return '';
  try { convertAsciiBinaryToText(inputBinary.value); return ''; } catch { return t('tools.textToBinary.invalidBinary'); }
});

const textFromBinary = computed(() => {
  if (!inputBinary.value) return '';
  try { return convertAsciiBinaryToText(inputBinary.value); } catch { return ''; }
});

function isValidBinary(v: string) {
  if (!v) return true;
  try { convertAsciiBinaryToText(v); return true; } catch { return false; }
}

function copyBinary() {
  if (binaryFromText.value) copyToClipboard(binaryFromText.value);
}
function copyText() {
  if (textFromBinary.value) copyToClipboard(textFromBinary.value);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.textToBinary.textToAsciiBinary')">
        <NSpace vertical :size="8">
          <NInput v-model:value="inputText" type="textarea" :rows="4" :placeholder="t('tools.textToBinary.inputPlaceholder')" />
          <NInput :value="binaryFromText" type="textarea" :rows="4" readonly :placeholder="t('tools.textToBinary.binaryOutputPlaceholder')" />
          <NButton :disabled="!binaryFromText" @click="copyBinary">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
      <NCard :title="t('tools.textToBinary.asciiBinaryToText')">
        <NSpace vertical :size="8">
          <NInput v-model:value="inputBinary" type="textarea" :rows="4" :placeholder="t('tools.textToBinary.binaryInputPlaceholder')" :status="inputBinary && !isValidBinary(inputBinary) ? 'error' : undefined" />
          <NAlert v-if="binaryError" type="error" :title="binaryError" />
          <NInput :value="textFromBinary" type="textarea" :rows="4" readonly :placeholder="t('tools.textToBinary.textOutputPlaceholder')" />
          <NButton :disabled="!textFromBinary" @click="copyText">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
