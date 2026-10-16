<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { convertTextToUnicode, convertUnicodeToText } from './text-to-unicode.service';

const { t } = useI18n();
const tool = useCurrentTool();

const inputText = ref('');
const unicodeOutput = computed(() => inputText.value ? convertTextToUnicode(inputText.value) : '');

const inputUnicode = ref('');
const textOutput = computed(() => inputUnicode.value ? convertUnicodeToText(inputUnicode.value) : '');
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <ToolTextPanel v-model:input-text="inputText" :output-text="unicodeOutput" :input-title="t('common.input')" :output-title="t('tools.textToUnicode.textToUnicodeEntities')" export-name="unicode.txt" stack-on-mobile wrap-actions>
        <template #input>
          <NInput v-model:value="inputText" type="textarea" :rows="4" :placeholder="t('tools.textToUnicode.inputPlaceholder')"  :input-props="{ id: 'textToUnicodeField0' }"/>
        </template>
        <template #output>
          <NInput :value="unicodeOutput" type="textarea" :rows="4" readonly :placeholder="t('tools.textToUnicode.unicodeOutputPlaceholder')"  :input-props="{ id: 'textToUnicodeField1' }"/>
        </template>
      </ToolTextPanel>
      <ToolTextPanel v-model:input-text="inputUnicode" :output-text="textOutput" :input-title="t('common.input')" :output-title="t('tools.textToUnicode.unicodeEntitiesToText')" export-name="output.txt" stack-on-mobile wrap-actions>
        <template #input>
          <NInput v-model:value="inputUnicode" type="textarea" :rows="4" :placeholder="t('tools.textToUnicode.unicodeInputPlaceholder')"  :input-props="{ id: 'textToUnicodeField2' }"/>
        </template>
        <template #output>
          <NInput :value="textOutput" type="textarea" :rows="4" readonly :placeholder="t('tools.textToUnicode.textOutputPlaceholder')"  :input-props="{ id: 'textToUnicodeField3' }"/>
        </template>
      </ToolTextPanel>
    </NSpace>
  </ToolLayout>
</template>
