<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NAlert, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const inputUrl = ref('');

const decodedUrl = computed(() => {
  if (!inputUrl.value.trim()) return '';
  try {
    return decodeSafeLinksURL(inputUrl.value.trim());
  } catch (e: unknown) {
    if (e instanceof Error) return `Error: ${e.message}`;
    return 'Error: Unknown error';
  }
});

const hasError = computed(() => decodedUrl.value.startsWith('Error:'));

function decodeSafeLinksURL(safeLinksUrl: string): string {
  if (!safeLinksUrl.includes('.safelinks.protection.outlook.com')) {
    throw new Error(t('tools.safelinkDecoder.invalidUrl'));
  }
  const url = new URL(safeLinksUrl);
  const originalUrl = url.searchParams.get('url');
  if (!originalUrl) {
    throw new Error(t('tools.safelinkDecoder.noUrlParam'));
  }
  return originalUrl;
}

function copyDecoded() {
  if (decodedUrl.value && !hasError.value) {
    copyToClipboard(decodedUrl.value);
  }
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard>
        <NSpace vertical :size="12">
          <NInput
            v-model:value="inputUrl"
            :placeholder="t('tools.safelinkDecoder.inputPlaceholder')"
            clearable
          />
        </NSpace>
      </NCard>

      <NCard :title="t('tools.safelinkDecoder.output')">
        <div v-if="decodedUrl" style="word-break: break-all; margin-bottom: 12px;">
          <NAlert v-if="hasError" type="error">
            {{ decodedUrl }}
          </NAlert>
          <div v-else style="font-family: monospace; font-size: 14px;">
            {{ decodedUrl }}
          </div>
        </div>
        <NButton
          v-if="decodedUrl && !hasError"
          @click="copyDecoded"
        >
          {{ t('tool.copy') }}
        </NButton>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
