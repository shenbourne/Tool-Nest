<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { convertTextToUnicode, convertUnicodeToText } from './text-to-unicode.service';

const { t } = useI18n();
const tool = useCurrentTool();

const inputText = ref('');
const unicodeOutput = computed(() => inputText.value ? convertTextToUnicode(inputText.value) : '');

const inputUnicode = ref('');
const textOutput = computed(() => inputUnicode.value ? convertUnicodeToText(inputUnicode.value) : '');

function copyUnicode() {
  if (unicodeOutput.value) navigator.clipboard.writeText(unicodeOutput.value);
}

function copyText() {
  if (textOutput.value) navigator.clipboard.writeText(textOutput.value);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Text → Unicode Entities">
        <NSpace vertical :size="8">
          <NInput v-model:value="inputText" type="textarea" :rows="4" placeholder="Enter text to convert to Unicode entities..." />
          <NInput :value="unicodeOutput" type="textarea" :rows="4" readonly placeholder="Unicode entities output..." />
          <NButton :disabled="!unicodeOutput" @click="copyUnicode">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>

      <NCard title="Unicode Entities → Text">
        <NSpace vertical :size="8">
          <NInput v-model:value="inputUnicode" type="textarea" :rows="4" placeholder="e.g. &#72;&#101;&#108;&#108;&#111;" />
          <NInput :value="textOutput" type="textarea" :rows="4" readonly placeholder="Text output..." />
          <NButton :disabled="!textOutput" @click="copyText">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
