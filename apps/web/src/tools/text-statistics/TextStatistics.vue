<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NStatistic } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
const { t } = useI18n();
const text = ref('');
const chars = computed(() => text.value.length);
const charsNoSpace = computed(() => text.value.replace(/\s/g, '').length);
const words = computed(() => text.value.trim() ? text.value.trim().split(/\s+/).length : 0);
const lines = computed(() => text.value ? text.value.split('\n').length : 0);
const sentences = computed(() => text.value.trim() ? (text.value.match(/[.!?]+/g) || []).length || (text.value.trim() ? 1 : 0) : 0);
const paragraphs = computed(() => text.value.trim() ? text.value.split(/\n\s*\n/).filter(p => p.trim()).length : 0);
const readingTime = computed(() => t('tools.textStats.readingTimeValue', { count: Math.ceil(words.value / 200) }));
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="text" :output-text="''" :input-title="t('common.input')" hide-output>
      <template #input>
        <NInput v-model:value="text" type="textarea" :rows="8" :placeholder="t('tools.textStats.inputPlaceholder')"  :input-props="{ id: 'textStatisticsField0' }"/>
      </template>
      <template #params>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px;">
          <NStatistic :label="t('tools.textStats.characters')" :value="chars" />
          <NStatistic :label="t('tools.textStats.charactersNoSpaces')" :value="charsNoSpace" />
          <NStatistic :label="t('tools.textStats.words')" :value="words" />
          <NStatistic :label="t('tools.textStats.lines')" :value="lines" />
          <NStatistic :label="t('tools.textStats.sentences')" :value="sentences" />
          <NStatistic :label="t('tools.textStats.paragraphs')" :value="paragraphs" />
          <NStatistic :label="t('tools.textStats.readingTime')" :value="readingTime" />
        </div>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
