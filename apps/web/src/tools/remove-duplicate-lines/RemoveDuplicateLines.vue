<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSwitch } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
import { deduplicateLines } from './remove-duplicate-lines.service';
const { t } = useI18n();
const input = ref('');
const keepEmpty = ref(true);
const output = computed(() => deduplicateLines(input.value, keepEmpty.value));
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="t('common.inputPlaceholder')"  :input-props="{ id: 'removeDuplicateLinesField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')"  :input-props="{ id: 'removeDuplicateLinesField1' }"/>
      </template>
      <template #params>
        <label class="tool-switch-label"><NSwitch v-model:value="keepEmpty" :aria-label="t('tools.removeDuplicateLines.keepEmpty')" /><span>{{ t('tools.removeDuplicateLines.keepEmpty') }}</span></label>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
