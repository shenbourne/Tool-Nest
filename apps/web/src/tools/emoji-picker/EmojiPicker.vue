<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
const { t } = useI18n();
const { copyToClipboard } = useCopy();
const search = ref('');
const EMOJIS: [string, string][] = [
  ['😀','grinning'],['😂','joy'],['😍','heart_eyes'],['🤔','thinking'],['😎','sunglasses'],
  ['🥳','partying'],['😭','sob'],['🔥','fire'],['❤️','heart'],['👍','thumbsup'],
  ['👎','thumbsdown'],['🎉','tada'],['✨','sparkles'],['💯','100'],['🚀','rocket'],
  ['⭐','star'],['🌈','rainbow'],['🎯','dart'],['💡','bulb'],['🔑','key'],
  ['✅','check'],['❌','cross'],['⚡','zap'],['🎵','music'],['📌','pin'],
  ['💻','computer'],['📱','phone'],['🌍','earth'],['☀️','sun'],['🌙','moon'],
  ['🐱','cat'],['🐶','dog'],['🦊','fox'],['🐻','bear'],['🐼','panda'],
  ['🍕','pizza'],['🍔','burger'],['☕','coffee'],['🍺','beer'],['🎂','cake'],
];
const filtered = computed(() => EMOJIS.filter(([,name]) => !search.value || name.includes(search.value.toLowerCase())));
function copy(e: string) { copyToClipboard(e); }
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="search" :placeholder="t('tools.emojiPicker.searchPlaceholder')" clearable />
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(50px,1fr));gap:4px;">
        <NButton v-for="[emoji, name] in filtered" :key="name" quaternary size="large" @click="copy(emoji)" :title="name" style="font-size:24px;height:48px;">{{ emoji }}</NButton>
      </div>
    </NSpace></NCard>
  </ToolLayout>
</template>
