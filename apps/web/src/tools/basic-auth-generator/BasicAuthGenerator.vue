<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NButton, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const username = ref('');
const password = ref('');

const header = computed(() => {
  // `btoa` throws on non-Latin-1 input (e.g. Chinese or emoji); percent-encode
  // first so arbitrary credentials never crash the render.
  const encoded = btoa(unescape(encodeURIComponent(`${username.value}:${password.value}`)));
  return `Authorization: Basic ${encoded}`;
});

function copyHeader() {
  copyToClipboard(header.value);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard>
        <NSpace vertical :size="12">
          <NInput
            v-model:value="username"
            :placeholder="t('tools.basicAuthGenerator.usernamePlaceholder')"
            clearable
          />
          <NInput
            v-model:value="password"
            type="password"
            show-password-on="click"
            :placeholder="t('tools.basicAuthGenerator.passwordPlaceholder')"
            clearable
          />
        </NSpace>
      </NCard>

      <NCard :title="t('tools.basicAuthGenerator.authorizationHeader')">
        <div style="font-family: monospace; font-size: 14px; word-break: break-all; margin-bottom: 12px;">
          {{ header }}
        </div>
        <NButton @click="copyHeader">
          {{ t('tool.copy') }}
        </NButton>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
