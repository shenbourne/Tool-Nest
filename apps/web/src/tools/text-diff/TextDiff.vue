<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const text1 = ref('');
const text2 = ref('');
// Simple line-by-line diff
const diff = computed(() => {
  const lines1 = text1.value.split('\n');
  const lines2 = text2.value.split('\n');
  const maxLen = Math.max(lines1.length, lines2.length);
  const result: { type: 'same' | 'added' | 'removed' | 'changed'; line1?: string; line2?: string; num: number }[] = [];
  for (let i = 0; i < maxLen; i++) {
    const l1 = lines1[i], l2 = lines2[i];
    if (l1 === undefined) result.push({ type: 'added', line2: l2, num: i + 1 });
    else if (l2 === undefined) result.push({ type: 'removed', line1: l1, num: i + 1 });
    else if (l1 === l2) result.push({ type: 'same', line1: l1, line2: l2, num: i + 1 });
    else result.push({ type: 'changed', line1: l1, line2: l2, num: i + 1 });
  }
  return result;
});
const stats = computed(() => {
  const s = { same: 0, added: 0, removed: 0, changed: 0 };
  diff.value.forEach(d => s[d.type]++);
  return s;
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <div style="display:flex;gap:12px;">
        <NCard :title="t('tools.textDiff.original')" style="flex:1;"><NInput v-model:value="text1" type="textarea" :rows="8"  :input-props="{ id: 'textDiffField0' }"/></NCard>
        <NCard :title="t('tools.textDiff.modified')" style="flex:1;"><NInput v-model:value="text2" type="textarea" :rows="8"  :input-props="{ id: 'textDiffField1' }"/></NCard>
      </div>
      <NSpace><NTag type="success">{{ t('tools.textDiff.same', { count: stats.same }) }}</NTag><NTag type="warning">{{ t('tools.textDiff.changed', { count: stats.changed }) }}</NTag><NTag type="error">{{ t('tools.textDiff.removed', { count: stats.removed }) }}</NTag><NTag type="info">{{ t('tools.textDiff.added', { count: stats.added }) }}</NTag></NSpace>
      <NCard v-if="text1 || text2" :title="t('tools.textDiff.diff')"><div style="font-family:monospace;font-size:13px;">
        <div v-for="d in diff" :key="d.num" :style="{ padding: '2px 8px', background: d.type==='added'?'#e6ffed':d.type==='removed'?'#ffeef0':d.type==='changed'?'#fff5b1':'transparent' }">
          <span style="opacity:0.4;width:30px;display:inline-block;">{{ d.num }}</span>
          <span v-if="d.type==='removed'" style="color:var(--color-error);">- {{ d.line1 }}</span>
          <span v-else-if="d.type==='added'" style="color:var(--color-success);">+ {{ d.line2 }}</span>
          <span v-else-if="d.type==='changed'"><span style="color:var(--color-error);">- {{ d.line1 }}</span><br/><span style="color:var(--color-success);margin-left:30px;">+ {{ d.line2 }}</span></span>
          <span v-else>{{ d.line1 }}</span>
        </div>
      </div></NCard>
    </NSpace>
  </ToolLayout>
</template>
