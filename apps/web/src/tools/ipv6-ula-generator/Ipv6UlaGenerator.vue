<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSpace, NAlert, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { generateULA } from './ipv6-ula-generator.service';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const tool = useCurrentTool();

const ulaResult = ref(generateULA(''));

function regenerate() {
  ulaResult.value = generateULA('');
}

function copyValue(value: string) {
  copyToClipboard(value);
}

const sections = computed(() => [
  { label: 'IPv6 ULA', value: ulaResult.value.ula },
  { label: 'First Routable Block', value: ulaResult.value.firstBlock },
  { label: 'Last Routable Block', value: ulaResult.value.lastBlock },
  { label: 'Global ID (hex)', value: ulaResult.value.globalId },
]);
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NAlert type="info">
        Generates IPv6 Unique Local Addresses (ULA) per RFC 4193.
        The 40-bit global ID is randomly generated using cryptographically secure randomness.
      </NAlert>

      <NCard title="IPv6 ULA Address">
        <NSpace vertical :size="8">
          <div v-for="section in sections" :key="section.label" class="ula-row">
            <span class="ula-label">{{ section.label }}:</span>
            <span class="ula-value">{{ section.value }}</span>
            <button class="copy-btn" @click="copyValue(section.value)">{{ t('tool.copy') }}</button>
          </div>
        </NSpace>
        <NSpace justify="center" style="margin-top: 16px">
          <NButton type="primary" @click="regenerate">{{ t('common.generationActions.ipv6Ula') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>

<style scoped>
.ula-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
}
.ula-label {
  min-width: 160px;
  font-weight: 600;
  text-align: right;
}
.ula-value {
  flex: 1;
  font-family: monospace;
  word-break: break-all;
}
.copy-btn {
  cursor: pointer;
  padding: 2px 8px;
  border: 1px solid var(--color-hairline);
  border-radius: 4px;
  background: transparent;
  font-size: 12px;
  white-space: nowrap;
}
.copy-btn:hover {
  background: var(--color-surface-2);
}
</style>
