<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NButton, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('https://example.com/path?q=hello world&lang=en');
const encoded = computed(() => { try { return encodeURIComponent(input.value); } catch { return ''; } });
const decoded = computed(() => { try { return decodeURIComponent(input.value); } catch { return ''; } });
function copyEncoded() { navigator.clipboard.writeText(encoded.value); }
function copyDecoded() { navigator.clipboard.writeText(decoded.value); }
</script>
<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('common.encode')">
        <NSpace vertical :size="8">
          <NInput v-model:value="input" type="textarea" :rows="3" :placeholder="t('tools.urlEncoder.inputPlaceholder')" />
          <NInput :value="encoded" readonly :label="t('tools.urlEncoder.encoded')" />
          <NButton size="small" @click="copyEncoded">{{ t('tools.urlEncoder.copyEncoded') }}</NButton>
        </NSpace>
      </NCard>
      <NCard :title="t('common.decode')">
        <NSpace vertical :size="8">
          <NInput :value="decoded" readonly :label="t('tools.urlEncoder.decoded')" />
          <NButton size="small" @click="copyDecoded">{{ t('tools.urlEncoder.copyDecoded') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
