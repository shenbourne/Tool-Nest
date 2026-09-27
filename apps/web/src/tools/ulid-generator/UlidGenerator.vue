<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NInputNumber, NButton, NSpace, NFormItem } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { ulid } from 'ulid';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const count = ref(1);
const ulids = computed(() =>
  Array.from({ length: count.value }, () => ulid()).join('\n')
);

function copy() { copyToClipboard(ulids.value); }
function refresh() { count.value = count.value; }
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="16">
        <NFormItem :label="t('common.quantity')" label-placement="left">
          <NInputNumber v-model:value="count" :min="1" :max="50" style="width: 200px;" />
        </NFormItem>
        <NInput :value="ulids" type="textarea" readonly :rows="Math.min(count + 1, 10)" style="font-family: monospace; text-align: center;" />
        <div style="display: flex; justify-content: center; gap: 12px;">
          <NButton @click="copy">{{ t('tool.copy') }}</NButton>
          <NButton @click="refresh">{{ t('common.retry') }}</NButton>
        </div>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
