<script setup lang="ts">
import { ref, computed } from 'vue';
import { NSwitch, NSlider, NInput, NInputNumber, NButton, NFormItem } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { createToken, tool } from './index';

const { t } = useI18n();

const length = ref(64);
const withUppercase = ref(true);
const withLowercase = ref(true);
const withNumbers = ref(true);
const withSymbols = ref(false);

const nonce = ref(0);
const token = computed(() => {
  void nonce.value;
  return createToken({ length: length.value, withUppercase: withUppercase.value, withLowercase: withLowercase.value, withNumbers: withNumbers.value, withSymbols: withSymbols.value });
});

function refresh() { nonce.value++; }

function updateLength(value: number | null) {
  if (value !== null) length.value = Math.min(512, Math.max(1, Math.round(value)));
}
</script>

<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel :input-text="''" :output-text="token" :output-title="t('common.output')" export-name="token.txt" hide-input>
      <template #output>
        <NInput :value="token" type="textarea" readonly :rows="3" style="text-align: center; font-family: monospace;"  :input-props="{ id: 'tokenGeneratorField0' }"/>
      </template>
      <template #params>
        <div class="token-options">
            <NFormItem :label="t('common.uppercase')" label-placement="left">
              <NSwitch v-model:value="withUppercase" />
            </NFormItem>
            <NFormItem :label="t('common.lowercase')" label-placement="left">
              <NSwitch v-model:value="withLowercase" />
            </NFormItem>
            <NFormItem :label="t('common.numbers')" label-placement="left">
              <NSwitch v-model:value="withNumbers" />
            </NFormItem>
            <NFormItem :label="t('common.symbols')" label-placement="left">
              <NSwitch v-model:value="withSymbols" />
            </NFormItem>
        </div>
        <NFormItem :label="t('common.length')" label-placement="left">
          <div class="token-length">
            <NInputNumber :value="length" :min="1" :max="512" :step="1" :precision="0" :aria-label="t('common.length')" @update:value="updateLength" />
            <NSlider v-model:value="length" :step="1" :min="1" :max="512" />
          </div>
        </NFormItem>
        <NButton type="primary" block @click="refresh">{{ t('common.generationActions.token') }}</NButton>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>

<style scoped>
.token-options {
  display: flex;
  justify-content: center;
  gap: 32px;
  overflow-x: auto;
}

.token-options :deep(.n-form-item) {
  flex-shrink: 0;
}

.token-length {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.token-length :deep(.n-input-number) {
  width: 110px;
  flex-shrink: 0;
}

.token-length :deep(.n-slider) {
  flex: 1;
  min-width: 0;
}
</style>
