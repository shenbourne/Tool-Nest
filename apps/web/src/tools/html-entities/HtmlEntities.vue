<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('<div class="test">Hello & "World"</div>');
const decodeInput = ref('&lt;div class=&quot;test&quot;&gt;Hello &amp; &quot;World&quot;&lt;/div&gt;');
function escapeHtml(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function unescapeHtml(s: string) { return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'"); }
const escaped = computed(() => escapeHtml(input.value));
const unescaped = computed(() => unescapeHtml(decodeInput.value));
</script>
<template>
  <ToolLayout :tool="tool">
    <div class="html-entities">
    <ToolTextPanel v-model:input-text="input" :output-text="escaped" :input-title="t('common.input')" :output-title="t('tools.htmlEntities.escaped')" export-name="entities.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="4"  :input-props="{ id: 'htmlEntitiesField0' }"/>
      </template>
      <template #output>
        <NInput :value="escaped" readonly type="textarea" :rows="4"  :input-props="{ id: 'htmlEntitiesField1' }"/>
      </template>
    </ToolTextPanel>
    <ToolTextPanel v-model:input-text="decodeInput" :output-text="unescaped" :input-title="t('common.input')" :output-title="t('tools.htmlEntities.unescaped')" export-name="unescaped.txt">
      <template #input>
        <NInput v-model:value="decodeInput" type="textarea" :rows="4" :input-props="{ id: 'htmlEntitiesDecodeInput' }"/>
      </template>
      <template #output>
        <NInput :value="unescaped" readonly type="textarea" :rows="4"  :input-props="{ id: 'htmlEntitiesField2' }"/>
      </template>
    </ToolTextPanel>
    </div>
  </ToolLayout>
</template>

<style scoped>
.html-entities {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

@media (max-width: 640px) {
  .html-entities :deep(.tool-text-panel__columns) {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
