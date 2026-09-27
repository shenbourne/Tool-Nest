<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSelect, NButton, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import * as bip39 from 'bip39';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';

const { t } = useI18n();
const { copyToClipboard } = useCopy();

const wordCountOptions = computed(() =>
  [12, 15, 18, 21, 24].map(n => ({ label: t('tools.bip39Generator.wordCount', { n }), value: n }))
);

const words = ref(12);
const mnemonic = computed(() => {
  try { return bip39.generateMnemonic(words.value === 12 ? 128 : words.value === 15 ? 160 : words.value === 18 ? 192 : words.value === 21 ? 224 : 256); } catch { return ''; }
});

const inputMnemonic = ref('');
const isValid = computed(() => {
  if (!inputMnemonic.value) return null;
  try { return bip39.validateMnemonic(inputMnemonic.value); } catch { return false; }
});

function copy() { copyToClipboard(mnemonic.value); }
function refresh() { words.value = words.value; }
</script>

<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('tools.bip39Generator.generateMnemonic')">
        <NSpace vertical :size="12">
          <NSelect v-model:value="words" :options="wordCountOptions" />
          <NInput :value="mnemonic" type="textarea" readonly :rows="4" style="font-family: monospace;" />
          <div style="display: flex; gap: 12px;">
            <NButton @click="copy">{{ t('tool.copy') }}</NButton>
            <NButton @click="refresh">{{ t('common.retry') }}</NButton>
          </div>
        </NSpace>
      </NCard>

      <NCard :title="t('tools.bip39Generator.validateMnemonic')">
        <NSpace vertical :size="12">
          <NInput v-model:value="inputMnemonic" type="textarea" :rows="3" :placeholder="t('tools.bip39Generator.validatePlaceholder')" />
          <div v-if="isValid !== null" :style="{ color: isValid ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }">
            {{ isValid ? t('tools.bip39Generator.validMnemonic') : t('tools.bip39Generator.invalidMnemonic') }}
          </div>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
