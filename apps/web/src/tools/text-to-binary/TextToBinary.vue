<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { convertTextToAsciiBinary, convertAsciiBinaryToText } from './text-to-binary.service';

const { t } = useI18n();
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
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <ToolTextPanel v-model:input-text="inputText" :output-text="binaryFromText" :input-title="t('common.input')" :output-title="t('tools.textToBinary.textToAsciiBinary')" export-name="binary.txt">
        <template #input>
          <NInput v-model:value="inputText" type="textarea" :rows="4" :placeholder="t('tools.textToBinary.inputPlaceholder')"  :input-props="{ id: 'textToBinaryField0' }"/>
        </template>
        <template #output>
          <NInput :value="binaryFromText" type="textarea" :rows="4" readonly :placeholder="t('tools.textToBinary.binaryOutputPlaceholder')"  :input-props="{ id: 'textToBinaryField1' }"/>
        </template>
      </ToolTextPanel>
      <ToolTextPanel v-model:input-text="inputBinary" :output-text="textFromBinary" :input-title="t('common.input')" :output-title="t('tools.textToBinary.asciiBinaryToText')" export-name="output.txt">
        <template #input>
          <NInput v-model:value="inputBinary" type="textarea" :rows="4" :placeholder="t('tools.textToBinary.binaryInputPlaceholder')" :status="inputBinary && !isValidBinary(inputBinary) ? 'error' : undefined"  :input-props="{ id: 'textToBinaryField2' }"/>
        </template>
        <template #output>
          <NInput :value="textFromBinary" type="textarea" :rows="4" readonly :placeholder="t('tools.textToBinary.textOutputPlaceholder')"  :input-props="{ id: 'textToBinaryField3' }"/>
        </template>
        <template #params>
          <NAlert v-if="binaryError" type="error" :title="binaryError" />
        </template>
      </ToolTextPanel>
    </NSpace>
  </ToolLayout>
</template>
