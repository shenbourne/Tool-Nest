<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NButton, NSpace, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
const { t } = useI18n();
const { copyToClipboard } = useCopy();
const input = ref('https://example.com/path?q=hello world&lang=en');
const encoded = computed(() => { try { return encodeURIComponent(input.value); } catch { return ''; } });
const decoded = computed(() => { try { return decodeURIComponent(input.value); } catch { return ''; } });
// A rejected decode must not look identical to an empty decode result.
const decodeError = computed(() => {
  try { decodeURIComponent(input.value); return ''; } catch { return t('tools.urlEncoder.invalidEncoding'); }
});
function copyEncoded() { copyToClipboard(encoded.value); }
function copyDecoded() { copyToClipboard(decoded.value); }
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
          <NAlert v-if="decodeError" type="error" :title="decodeError" />
          <NButton size="small" @click="copyDecoded">{{ t('tools.urlEncoder.copyDecoded') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
