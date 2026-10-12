<script setup lang="ts">
import { ref } from 'vue';
import { NInputNumber, NSwitch, NButton, NInput, NAlert, NSpace, NSelect } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
import { computed } from 'vue';
import { generateSecret, secretPresets } from './password-generator.service';
const { t } = useI18n();
const preset = ref<'password' | 'token'>('password');
const length = ref<number | null>(16);
const upper = ref(true);
const lower = ref(true);
const nums = ref(true);
const syms = ref(true);
const exclude = ref('');
const pw = ref('');
const error = ref('');
const presetOptions = computed(() => [
  { label: t('tools.passwordGenerator.passwordPreset'), value: 'password' },
  { label: t('tools.passwordGenerator.tokenPreset'), value: 'token' },
]);
function applyPreset(value: 'password' | 'token') {
  preset.value = value;
  const options = secretPresets[value];
  length.value = options.length;
  upper.value = options.upper;
  lower.value = options.lower;
  nums.value = options.numbers;
  syms.value = options.symbols;
  pw.value = '';
  error.value = '';
}
function gen() {
  error.value = '';
  pw.value = '';
  try {
    pw.value = generateSecret({ length: length.value ?? 0, upper: upper.value, lower: lower.value, numbers: nums.value, symbols: syms.value, exclude: exclude.value });
  } catch (cause) {
    error.value = t(`tools.passwordGenerator.${cause instanceof Error && cause.message === 'invalidLength' ? 'invalidLength' : 'selectOneOption'}`);
  }
}
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel :input-text="''" :output-text="pw" :output-title="t('common.output')" :export-name="`${preset}.txt`" hide-input>
      <template #output>
        <NInput :value="pw" type="textarea" :rows="3" readonly :placeholder="t('tools.passwordGenerator.outputPlaceholder')"  :input-props="{ id: 'passwordGeneratorField2' }"/>
      </template>
      <template #params>
        <NSpace align="center">
          <NSelect :value="preset" :options="presetOptions" :aria-label="t('tools.passwordGenerator.preset')" style="width:160px" @update:value="applyPreset" />
          <label for="passwordGeneratorField0">{{ t('common.length') }}:</label><NInputNumber v-model:value="length" :min="1" :max="512" :precision="0" style="width:100px"  :input-props="{ id: 'passwordGeneratorField0' }"/>
        </NSpace>
        <NSpace>
          <label class="tool-switch-label"><NSwitch v-model:value="upper" :aria-label="t('common.uppercase')" /><span>{{ t('common.uppercase') }}</span></label>
          <label class="tool-switch-label"><NSwitch v-model:value="lower" :aria-label="t('common.lowercase')" /><span>{{ t('common.lowercase') }}</span></label>
          <label class="tool-switch-label"><NSwitch v-model:value="nums" :aria-label="t('common.numbers')" /><span>{{ t('common.numbers') }}</span></label>
          <label class="tool-switch-label"><NSwitch v-model:value="syms" :aria-label="t('common.symbols')" /><span>{{ t('common.symbols') }}</span></label>
        </NSpace>
        <NInput v-model:value="exclude" :placeholder="t('tools.passwordGenerator.excludePlaceholder')"  :input-props="{ id: 'passwordGeneratorField1' }"/>
        <NButton type="primary" @click="gen">{{ t(preset === 'token' ? 'tools.passwordGenerator.generateToken' : 'tools.passwordGenerator.generatePassword') }}</NButton>
        <NAlert v-if="error" type="error" :title="error" />
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
