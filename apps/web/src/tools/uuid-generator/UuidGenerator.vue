<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NInputNumber, NSelect, NButton, NSpace, NFormItem } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { v4 as uuidv4 } from 'uuid';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();
const count = ref(1);
const uuids = computed(() =>
  Array.from({ length: count.value }, () => uuidv4()).join('\n')
);

function copy() { navigator.clipboard.writeText(uuids.value); }
function refresh() { count.value = count.value; }
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="16">
        <NFormItem :label="t('common.quantity')" label-placement="left">
          <NInputNumber v-model:value="count" :min="1" :max="50" style="width: 200px;" />
        </NFormItem>
        <NInput :value="uuids" type="textarea" readonly :rows="Math.min(count + 1, 10)" style="font-family: monospace; text-align: center;" />
        <div style="display: flex; justify-content: center; gap: 12px;">
          <NButton @click="copy">{{ t('tool.copy') }}</NButton>
          <NButton @click="refresh">{{ t('common.retry') }}</NButton>
        </div>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
