<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSwitch, NSlider, NInput, NButton, NFormItem, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { createToken, tool } from './index';

const { t } = useI18n();

const length = ref(64);
const withUppercase = ref(true);
const withLowercase = ref(true);
const withNumbers = ref(true);
const withSymbols = ref(false);

const token = computed(() =>
  createToken({ length: length.value, withUppercase: withUppercase.value, withLowercase: withLowercase.value, withNumbers: withNumbers.value, withSymbols: withSymbols.value })
);

function refresh() { length.value = length.value; }
function copy() { navigator.clipboard.writeText(token.value); }
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="16">
        <div style="display: flex; justify-content: center; gap: 32px;">
          <div>
            <NFormItem label="Uppercase" label-placement="left">
              <NSwitch v-model:value="withUppercase" />
            </NFormItem>
            <NFormItem label="Lowercase" label-placement="left">
              <NSwitch v-model:value="withLowercase" />
            </NFormItem>
          </div>
          <div>
            <NFormItem label="Numbers" label-placement="left">
              <NSwitch v-model:value="withNumbers" />
            </NFormItem>
            <NFormItem label="Symbols" label-placement="left">
              <NSwitch v-model:value="withSymbols" />
            </NFormItem>
          </div>
        </div>

        <NFormItem :label="`Length (${length})`" label-placement="left">
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
