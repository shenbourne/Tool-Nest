<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSwitch, NSlider, NInput, NButton, NFormItem, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { createToken, tool } from './index';

const { t } = useI18n();
const { copyToClipboard } = useCopy();

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
function copy() { copyToClipboard(token.value); }
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="16">
        <div style="display: flex; justify-content: center; gap: 32px;">
          <div>
            <NFormItem :label="t('common.uppercase')" label-placement="left">
              <NSwitch v-model:value="withUppercase" />
            </NFormItem>
            <NFormItem :label="t('common.lowercase')" label-placement="left">
              <NSwitch v-model:value="withLowercase" />
            </NFormItem>
          </div>
          <div>
            <NFormItem :label="t('common.numbers')" label-placement="left">
              <NSwitch v-model:value="withNumbers" />
            </NFormItem>
            <NFormItem :label="t('common.symbols')" label-placement="left">
              <NSwitch v-model:value="withSymbols" />
            </NFormItem>
          </div>
        </div>

        <NFormItem :label="`${t('common.length')} (${length})`" label-placement="left">
          <NSlider v-model:value="length" :step="1" :min="1" :max="512" />
        </NFormItem>

        <NInput :value="token" type="textarea" readonly :rows="3" style="text-align: center; font-family: monospace;" />

        <div style="display: flex; justify-content: center; gap: 12px;">
          <NButton @click="copy">{{ t('tool.copy') }}</NButton>
          <NButton @click="refresh">{{ t('common.retry') }}</NButton>
        </div>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
