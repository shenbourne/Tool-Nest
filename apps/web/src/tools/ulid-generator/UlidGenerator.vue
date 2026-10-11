<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NInputNumber, NButton, NFormItem } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { ulid } from 'ulid';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';

const { t } = useI18n();
const count = ref(1);
// Bumping nonce forces the computed below to re-run so refresh() actually
// regenerates instead of assigning count.value = count.value (a no-op).
const nonce = ref(0);
const ulids = computed(() => {
  void nonce.value;
  return Array.from({ length: count.value }, () => ulid()).join('\n');
});

function refresh() { nonce.value++; }
</script>

<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel :input-text="''" :output-text="ulids" :output-title="t('common.output')" export-name="ulids.txt" hide-input>
      <template #output>
        <NInput :value="ulids" type="textarea" readonly :rows="Math.min(count + 1, 10)" style="font-family: monospace; text-align: center;"  :input-props="{ id: 'ulidGeneratorField1' }"/>
      </template>
      <template #params>
        <div class="tool-generation-row">
        <NFormItem :label="t('common.quantity')" label-placement="left" :show-feedback="false">
          <NInputNumber v-model:value="count" :min="1" :max="50" style="width: 200px;"  :input-props="{ id: 'ulidGeneratorField0' }"/>
        </NFormItem>
        <NButton type="primary" @click="refresh">{{ t('common.generationActions.ulid') }}</NButton>
        </div>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
