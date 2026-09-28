<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { convertTextToUnicode, convertUnicodeToText } from './text-to-unicode.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const inputText = ref('');
const unicodeOutput = computed(() => inputText.value ? convertTextToUnicode(inputText.value) : '');

const inputUnicode = ref('');
const textOutput = computed(() => inputUnicode.value ? convertUnicodeToText(inputUnicode.value) : '');

function copyUnicode() {
  if (unicodeOutput.value) copyToClipboard(unicodeOutput.value);
}

function copyText() {
  if (textOutput.value) copyToClipboard(textOutput.value);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.textToUnicode.textToUnicodeEntities')">
        <NSpace vertical :size="8">
          <NInput v-model:value="inputText" type="textarea" :rows="4" :placeholder="t('tools.textToUnicode.inputPlaceholder')"  :input-props="{ id: 'textToUnicodeField0' }"/>
          <NInput :value="unicodeOutput" type="textarea" :rows="4" readonly :placeholder="t('tools.textToUnicode.unicodeOutputPlaceholder')"  :input-props="{ id: 'textToUnicodeField1' }"/>
          <NButton :disabled="!unicodeOutput" @click="copyUnicode">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>

      <NCard :title="t('tools.textToUnicode.unicodeEntitiesToText')">
        <NSpace vertical :size="8">
          <NInput v-model:value="inputUnicode" type="textarea" :rows="4" :placeholder="t('tools.textToUnicode.unicodeInputPlaceholder')"  :input-props="{ id: 'textToUnicodeField2' }"/>
          <NInput :value="textOutput" type="textarea" :rows="4" readonly :placeholder="t('tools.textToUnicode.textOutputPlaceholder')"  :input-props="{ id: 'textToUnicodeField3' }"/>
          <NButton :disabled="!textOutput" @click="copyText">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
