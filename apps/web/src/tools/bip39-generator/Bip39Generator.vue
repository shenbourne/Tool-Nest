<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSelect, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { generateMnemonic, validateMnemonic } from './bip39-generator.service';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';

const { t } = useI18n();

const wordCountOptions = computed(() =>
  [12, 15, 18, 21, 24].map(n => ({ label: t('tools.bip39Generator.wordCount', { n }), value: n }))
);

const words = ref(12);
// nonce lets the retry button force a fresh mnemonic instead of the old
// no-op `words.value = words.value`.
const nonce = ref(0);
const mnemonic = computed(() => {
  void nonce.value;
  return generateMnemonic(words.value);
});

const inputMnemonic = ref('');
const isValid = computed(() => {
  if (!inputMnemonic.value) return null;
  return validateMnemonic(inputMnemonic.value);
});

function refresh() { nonce.value++; }
</script>

<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel :input-text="''" :output-text="mnemonic" :output-title="t('tools.bip39Generator.generateMnemonic')" export-name="mnemonic.txt" hide-input>
      <template #output>
        <NInput :value="mnemonic" type="textarea" readonly :rows="4" style="font-family: monospace;"  :input-props="{ id: 'bip39GeneratorField0' }"/>
      </template>
      <template #params>
        <div class="mnemonic-actions">
          <NSelect v-model:value="words" :options="wordCountOptions" class="mnemonic-actions__count" />
          <NButton type="primary" @click="refresh">{{ t('common.generationActions.mnemonic') }}</NButton>
        </div>
        <div>
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">{{ t('tools.bip39Generator.validateMnemonic') }}</div>
          <NInput v-model:value="inputMnemonic" type="textarea" :rows="3" :placeholder="t('tools.bip39Generator.validatePlaceholder')"  :input-props="{ id: 'bip39GeneratorField1' }"/>
          <div v-if="isValid !== null" :style="{ color: isValid ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600, marginTop: '8px' }">
            {{ isValid ? t('tools.bip39Generator.validMnemonic') : t('tools.bip39Generator.invalidMnemonic') }}
          </div>
        </div>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>

<style scoped>
.mnemonic-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.mnemonic-actions__count {
  width: 160px;
  min-width: 0;
  flex: 0 1 160px;
}

.mnemonic-actions :deep(.n-button) {
  flex-shrink: 0;
  margin-left: auto;
}
</style>
