<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
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
    <NSpace vertical :size="16">
      <NCard :title="t('common.input')"><NInput v-model:value="input" type="textarea" :rows="4"  :input-props="{ id: 'htmlEntitiesField0' }"/></NCard>
      <NCard :title="t('tools.htmlEntities.escaped')"><NInput :value="escaped" readonly type="textarea" :rows="4"  :input-props="{ id: 'htmlEntitiesField1' }"/></NCard>
      <NCard :title="t('tools.htmlEntities.unescaped')"><NInput :value="unescaped" readonly type="textarea" :rows="4"  :input-props="{ id: 'htmlEntitiesField2' }"/></NCard>
    </NSpace>
  </ToolLayout>
</template>
