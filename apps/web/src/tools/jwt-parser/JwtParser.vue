<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('');
function decodeBase64Url(s: string) { try { return JSON.parse(decodeURIComponent(atob(s.replace(/-/g,'+').replace(/_/g,'/')).split('').map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''))); } catch { return null; } }
const parsed = computed(() => {
  const parts = input.value.trim().split('.');
  if (parts.length !== 3) return null;
  const header = decodeBase64Url(parts[0]);
  const payload = decodeBase64Url(parts[1]);
  if (!header || !payload) return null;
  return { header, payload, signature: parts[2] };
});
const headerText = computed(() => (parsed.value ? JSON.stringify(parsed.value.header, null, 2) : ''));
const payloadText = computed(() => (parsed.value ? JSON.stringify(parsed.value.payload, null, 2) : ''));
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="payloadText" :input-title="t('common.input')" :output-title="t('tools.jwtParser.payload')" export-name="payload.json">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="4" :placeholder="t('tools.jwtParser.inputPlaceholder')"  :input-props="{ id: 'jwtParserField0' }"/>
      </template>
      <template #output>
        <NInput :value="headerText" readonly type="textarea" :rows="4" style="font-family:monospace;"  :input-props="{ id: 'jwtParserField1' }"/>
        <div class="tool-text-panel__subtitle">{{ t('tools.jwtParser.header') }}</div>
        <NInput :value="payloadText" readonly type="textarea" :rows="8" style="font-family:monospace;"  :input-props="{ id: 'jwtParserField2' }"/>
      </template>
      <template #params>
        <NAlert v-if="input && !parsed" type="error">{{ t('tools.jwtParser.invalidFormat') }}</NAlert>
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
