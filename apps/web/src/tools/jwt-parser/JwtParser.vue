<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
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
</script>
<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard><NInput v-model:value="input" type="textarea" :rows="4" placeholder="Paste JWT token here..." /></NCard>
      <NAlert v-if="input && !parsed" type="error">Invalid JWT format</NAlert>
      <template v-if="parsed">
        <NCard title="Header"><NInput :value="JSON.stringify(parsed.header, null, 2)" readonly type="textarea" :rows="4" style="font-family:monospace;" /></NCard>
        <NCard title="Payload"><NInput :value="JSON.stringify(parsed.payload, null, 2)" readonly type="textarea" :rows="8" style="font-family:monospace;" /></NCard>
      </template>
    </NSpace>
  </ToolLayout>
</template>
