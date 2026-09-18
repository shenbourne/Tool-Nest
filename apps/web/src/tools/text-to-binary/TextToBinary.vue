<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { convertTextToAsciiBinary, convertAsciiBinaryToText } from './text-to-binary.service';

const { t } = useI18n();
const tool = useCurrentTool();

const inputText = ref('');
const binaryFromText = computed(() => inputText.value ? convertTextToAsciiBinary(inputText.value) : '');

const inputBinary = ref('');
const binaryError = ref('');
const textFromBinary = computed(() => {
  if (!inputBinary.value) return '';
  try { return convertAsciiBinaryToText(inputBinary.value); } catch { return ''; }
});

function isValidBinary(v: string) {
  if (!v) return true;
  try { convertAsciiBinaryToText(v); return true; } catch { return false; }
}

function copyBinary() {
  if (binaryFromText.value) navigator.clipboard.writeText(binaryFromText.value);
}
function copyText() {
  if (textFromBinary.value) navigator.clipboard.writeText(textFromBinary.value);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Text → ASCII Binary">
        <NSpace vertical :size="8">
          <NInput v-model:value="inputText" type="textarea" :rows="4" placeholder="e.g. 'Hello world'" />
          <NInput :value="binaryFromText" type="textarea" :rows="4" readonly placeholder="Binary output..." />
          <NButton :disabled="!binaryFromText" @click="copyBinary">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
      <NCard title="ASCII Binary → Text">
        <NSpace vertical :size="8">
          <NInput v-model:value="inputBinary" type="textarea" :rows="4" placeholder="e.g. '01001000 01100101 01101100 01101100 01101111'" :status="inputBinary && !isValidBinary(inputBinary) ? 'error' : undefined" />
          <NInput :value="textFromBinary" type="textarea" :rows="4" readonly placeholder="Text output..." />
          <NButton :disabled="!textFromBinary" @click="copyText">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
