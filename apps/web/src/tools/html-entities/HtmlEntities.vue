<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('<div class="test">Hello & "World"</div>');
function escapeHtml(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function unescapeHtml(s: string) { return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'"); }
const escaped = computed(() => escapeHtml(input.value));
const unescaped = computed(() => unescapeHtml(input.value));
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="escaped" :input-title="t('common.input')" :output-title="t('tools.htmlEntities.escaped')" export-name="entities.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="4"  :input-props="{ id: 'htmlEntitiesField0' }"/>
      </template>
      <template #output>
        <NInput :value="escaped" readonly type="textarea" :rows="4"  :input-props="{ id: 'htmlEntitiesField1' }"/>
        <div class="tool-text-panel__subtitle">{{ t('tools.htmlEntities.unescaped') }}</div>
        <NInput :value="unescaped" readonly type="textarea" :rows="4"  :input-props="{ id: 'htmlEntitiesField2' }"/>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>

<style scoped>
.tool-text-panel__subtitle {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-2);
}
</style>
