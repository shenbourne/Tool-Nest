<script setup lang="ts">
import { ref, watch } from 'vue';
import { NInputNumber, NButton, NInput, NSwitch, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
import { generateRandomNumbers } from './random-number-generator.service';
const { t } = useI18n();
const min = ref(1); const max = ref(100); const count = ref(1);
const unique = ref(false); const result = ref('');
function gen() {
  const res = generateRandomNumbers(min.value, max.value, count.value, unique.value);
  result.value = res.ok ? res.values.join(', ') : t(`tools.randomNumberGenerator.${res.error}`);
}
watch([min, max, count, unique], gen, { immediate: true });
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel :input-text="''" :output-text="result" :output-title="t('common.output')" export-name="random-numbers.txt" hide-input>
      <template #output>
        <NInput :value="result" type="textarea" :rows="4" readonly  :input-props="{ id: 'randomNumberGeneratorField3' }"/>
      </template>
      <template #params>        <NSpace>
        <div class="tool-numeric-param">
          <label for="randomNumberGeneratorField0">{{ t('common.min') }}:</label>
          <NInputNumber v-model:value="min" :placeholder="t('common.min')" style="width:120px"  :input-props="{ id: 'randomNumberGeneratorField0' }"/>
        </div>
        <div class="tool-numeric-param">
          <label for="randomNumberGeneratorField1">{{ t('common.max') }}:</label>
          <NInputNumber v-model:value="max" :placeholder="t('common.max')" style="width:120px"  :input-props="{ id: 'randomNumberGeneratorField1' }"/>
        </div>
        <div class="tool-numeric-param">
          <label for="randomNumberGeneratorField2">{{ t('common.count') }}:</label>
          <NInputNumber v-model:value="count" :min="1" :max="10000" :placeholder="t('common.count')" style="width:120px"  :input-props="{ id: 'randomNumberGeneratorField2' }"/>
        </div>
        </NSpace>
        <div class="tool-generation-row">
        <label class="tool-switch-label"><NSwitch v-model:value="unique" :aria-label="t('tools.randomNumberGenerator.uniqueOnly')" /><span>{{ t('tools.randomNumberGenerator.uniqueOnly') }}</span></label>
        <NButton type="primary" @click="gen">{{ t('common.generationActions.randomNumbers') }}</NButton>
        </div>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
