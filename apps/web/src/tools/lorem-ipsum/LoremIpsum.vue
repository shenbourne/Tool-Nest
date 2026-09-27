<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInputNumber, NSelect, NInput, NButton, NSpace, NFormItem } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
const { t } = useI18n();
const { copyToClipboard } = useCopy();
const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');
const count = ref(3);
const type = ref<'paragraphs' | 'sentences' | 'words'>('paragraphs');
function randWord() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }
function randSentence() { const len = 8 + Math.floor(Math.random() * 12); return Array.from({ length: len }, () => randWord()).join(' ').replace(/^./, c => c.toUpperCase()) + '.'; }
function randParagraph() { return Array.from({ length: 3 + Math.floor(Math.random() * 4) }, () => randSentence()).join(' '); }
const output = computed(() => {
  if (type.value === 'words') return Array.from({ length: count.value }, () => randWord()).join(' ');
  if (type.value === 'sentences') return Array.from({ length: count.value }, () => randSentence()).join(' ');
  return Array.from({ length: count.value }, () => randParagraph()).join('\n\n');
});
function copy() { copyToClipboard(output.value); }
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <div style="display:flex;gap:12px;">
        <NSelect v-model:value="type" :options="[{label:'Paragraphs',value:'paragraphs'},{label:'Sentences',value:'sentences'},{label:'Words',value:'words'}]" style="flex:1;" />
        <NInputNumber v-model:value="count" :min="1" :max="100" style="flex:1;" />
      </div>
      <NInput :value="output" type="textarea" readonly :rows="10" />
      <NButton @click="copy">{{ t('tool.copy') }}</NButton>
    </NSpace></NCard>
  </ToolLayout>
</template>
