<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { NInputNumber, NButton, NInput, NSwitch } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
import { generateRandomNumbers } from './random-number-generator.service';
const { t } = useI18n();
const min = ref(1); const max = ref(100); const count = ref(1);
const unique = ref(false); const result = ref('');
const allowRepeat = computed({
  get: () => !unique.value,
  set: (value: boolean) => { unique.value = !value; },
});
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
      <template #params>        <div class="random-number-params">
        <div class="tool-numeric-param">
          <label for="randomNumberGeneratorField0">{{ t('tools.randomNumberGenerator.min') }}:</label>
          <NInputNumber v-model:value="min" :placeholder="t('tools.randomNumberGenerator.min')" style="width:120px"  :input-props="{ id: 'randomNumberGeneratorField0' }"/>
        </div>
        <div class="tool-numeric-param">
          <label for="randomNumberGeneratorField1">{{ t('tools.randomNumberGenerator.max') }}:</label>
          <NInputNumber v-model:value="max" :placeholder="t('tools.randomNumberGenerator.max')" style="width:120px"  :input-props="{ id: 'randomNumberGeneratorField1' }"/>
        </div>
        <div class="tool-numeric-param">
          <label for="randomNumberGeneratorField2">{{ t('tools.randomNumberGenerator.count') }}:</label>
          <NInputNumber v-model:value="count" :min="1" :max="10000" :placeholder="t('tools.randomNumberGenerator.count')" style="width:120px"  :input-props="{ id: 'randomNumberGeneratorField2' }"/>
        </div>
        <label class="random-number-repeat">
          <span>{{ t('tools.randomNumberGenerator.allowRepeat') }}</span>
          <NSwitch v-model:value="allowRepeat" :aria-label="t('tools.randomNumberGenerator.allowRepeat')" />
        </label>
        </div>
        <NButton type="primary" block @click="gen">{{ t('common.generationActions.randomNumbers') }}</NButton>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
<style scoped>
.random-number-params {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
}
.random-number-repeat {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
