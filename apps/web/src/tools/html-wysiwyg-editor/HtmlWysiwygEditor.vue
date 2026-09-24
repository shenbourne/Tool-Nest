<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NCard, NInput, NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const tool = useCurrentTool();

const editorRef = ref<HTMLDivElement | null>(null);
const htmlOutput = ref('');

function execCmd(command: string, value?: string) {
  document.execCommand(command, false, value);
  updateOutput();
}

function insertLink() {
  const url = prompt('Enter URL:');
  if (url) {
    document.execCommand('createLink', false, url);
    updateOutput();
  }
}

function clearFormat() {
  document.execCommand('removeFormat');
  updateOutput();
}

function updateOutput() {
  if (editorRef.value) {
    htmlOutput.value = editorRef.value.innerHTML;
  }
}

function copyHtml() {
  if (htmlOutput.value) {
    navigator.clipboard.writeText(htmlOutput.value);
  }
}

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = '<p>Start typing here...</p>';
    updateOutput();
  }
});
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Editor">
        <NSpace vertical :size="12">
          <NSpace>
            <NButton size="small" @click="execCmd('bold')"><strong>B</strong></NButton>
            <NButton size="small" @click="execCmd('italic')"><em>I</em></NButton>
            <NButton size="small" @click="execCmd('underline')"><u>U</u></NButton>
            <NButton size="small" @click="execCmd('strikeThrough')"><s>S</s></NButton>
            <NButton size="small" @click="execCmd('formatBlock', '<h1>')">H1</NButton>
            <NButton size="small" @click="execCmd('formatBlock', '<h2>')">H2</NButton>
            <NButton size="small" @click="execCmd('formatBlock', '<h3>')">H3</NButton>
            <NButton size="small" @click="execCmd('insertUnorderedList')">UL</NButton>
            <NButton size="small" @click="execCmd('insertOrderedList')">OL</NButton>
            <NButton size="small" @click="insertLink">Link</NButton>
            <NButton size="small" @click="clearFormat">Clear</NButton>
          </NSpace>
          <div
            ref="editorRef"
            contenteditable="true"
            @input="updateOutput"
            style="min-height: 300px; border: 1px solid var(--color-hairline); border-radius: 4px; padding: 12px; outline: none; line-height: 1.6;"
          />
        </NSpace>
      </NCard>

      <NCard title="HTML Output">
        <NSpace vertical :size="12">
          <NInput
            type="textarea"
            :value="htmlOutput"
            readonly
            :autosize="{ minRows: 6, maxRows: 20 }"
          />
          <NButton @click="copyHtml">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
