<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NInputNumber, NButton, NFormItem } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { v4 as uuidv4 } from 'uuid';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';

const { t } = useI18n();
const count = ref(1);
// Bumping nonce forces the computed below to re-run so refresh() actually
// regenerates instead of assigning count.value = count.value (a no-op).
const nonce = ref(0);
const uuids = computed(() => {
  void nonce.value;
  return Array.from({ length: count.value }, () => uuidv4()).join('\n');
});

function refresh() { nonce.value++; }
</script>

<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel :input-text="''" :output-text="uuids" :output-title="t('common.output')" export-name="uuids.txt" hide-input>
      <template #output>
        <NInput :value="uuids" type="textarea" readonly :rows="Math.min(count + 1, 10)" style="font-family: monospace; text-align: center;"  :input-props="{ id: 'uuidGeneratorField1' }"/>
      </template>
      <template #params>
        <NFormItem :label="t('common.quantity')" label-placement="left">
          <NInputNumber v-model:value="count" :min="1" :max="50" style="width: 200px;"  :input-props="{ id: 'uuidGeneratorField0' }"/>
        </NFormItem>
        <NButton @click="refresh">{{ t('common.retry') }}</NButton>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
