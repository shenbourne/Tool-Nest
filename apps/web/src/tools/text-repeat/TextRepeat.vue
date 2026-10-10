<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NInputNumber } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('Hello');
const count = ref(5);
const output = computed(() => input.value.repeat(Math.min(count.value, 1000)));
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput v-model:value="input" :placeholder="t('tools.textRepeat.inputPlaceholder')"  :input-props="{ id: 'textRepeatField0' }"/>
      </template>
      <template #output>
        <NInput :value="output" type="textarea" :rows="6" readonly  :input-props="{ id: 'textRepeatField2' }"/>
      </template>
      <template #params>        <div class="tool-numeric-param">
          <label for="textRepeatField1">{{ t('numericParams.repeatCount') }}:</label>
          <NInputNumber v-model:value="count" :min="1" :max="1000" :placeholder="t('common.count')" style="width:150px"  :input-props="{ id: 'textRepeatField1' }"/>
        </div>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
