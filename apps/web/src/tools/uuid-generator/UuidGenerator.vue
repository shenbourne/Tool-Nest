<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NInputNumber, NSelect, NButton, NSpace, NFormItem } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { v4 as uuidv4 } from 'uuid';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
const count = ref(1);
// Bumping nonce forces the computed below to re-run so refresh() actually
// regenerates instead of assigning count.value = count.value (a no-op).
const nonce = ref(0);
const uuids = computed(() => {
  void nonce.value;
  return Array.from({ length: count.value }, () => uuidv4()).join('\n');
});

function copy() { copyToClipboard(uuids.value); }
function refresh() { nonce.value++; }
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="16">
        <NFormItem :label="t('common.quantity')" label-placement="left">
          <NInputNumber v-model:value="count" :min="1" :max="50" style="width: 200px;"  :input-props="{ id: 'uuidGeneratorField0' }"/>
        </NFormItem>
        <NInput :value="uuids" type="textarea" readonly :rows="Math.min(count + 1, 10)" style="font-family: monospace; text-align: center;"  :input-props="{ id: 'uuidGeneratorField1' }"/>
        <div style="display: flex; justify-content: center; gap: 12px;">
          <NButton @click="copy">{{ t('tool.copy') }}</NButton>
          <NButton @click="refresh">{{ t('common.retry') }}</NButton>
        </div>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
