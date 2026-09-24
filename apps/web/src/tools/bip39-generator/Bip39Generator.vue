<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSelect, NButton, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import * as bip39 from 'bip39';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const wordCountOptions = [
  { label: '12 words', value: 12 },
  { label: '15 words', value: 15 },
  { label: '18 words', value: 18 },
  { label: '21 words', value: 21 },
  { label: '24 words', value: 24 },
];

const words = ref(12);
const mnemonic = computed(() => {
  try { return bip39.generateMnemonic(words.value === 12 ? 128 : words.value === 15 ? 160 : words.value === 18 ? 192 : words.value === 21 ? 224 : 256); } catch { return ''; }
});

const inputMnemonic = ref('');
const isValid = computed(() => {
  if (!inputMnemonic.value) return null;
  try { return bip39.validateMnemonic(inputMnemonic.value); } catch { return false; }
});

function copy() { navigator.clipboard.writeText(mnemonic.value); }
function refresh() { words.value = words.value; }
</script>

<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Generate Mnemonic">
        <NSpace vertical :size="12">
          <NSelect v-model:value="words" :options="wordCountOptions" />
          <NInput :value="mnemonic" type="textarea" readonly :rows="4" style="font-family: monospace;" />
          <div style="display: flex; gap: 12px;">
            <NButton @click="copy">{{ t('tool.copy') }}</NButton>
            <NButton @click="refresh">{{ t('common.retry') }}</NButton>
          </div>
        </NSpace>
      </NCard>

      <NCard title="Validate Mnemonic">
        <NSpace vertical :size="12">
          <NInput v-model:value="inputMnemonic" type="textarea" :rows="3" placeholder="Enter mnemonic to validate..." />
          <div v-if="isValid !== null" :style="{ color: isValid ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }">
            {{ isValid ? 'Valid mnemonic ✓' : 'Invalid mnemonic ✗' }}
          </div>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
