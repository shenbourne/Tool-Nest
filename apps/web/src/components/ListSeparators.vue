<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { NAlert, NInput, NSelect } from 'naive-ui';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ inputSeparator?: string; outputSeparator: string | null }>();
const emit = defineEmits<{
  'update:inputSeparator': [value: string | undefined];
  'update:outputSeparator': [value: string | null];
}>();
const { t } = useI18n();
const inputChoice = ref('auto');
const outputChoice = ref('same');
const customInput = ref('');
const customOutput = ref('');
const delimiters = [',', ';', '\n', '\t', '|', ' '];
const options = computed(() => [
  ...['comma', 'semicolon', 'newline', 'tab', 'pipe', 'space'].map((key, i) => ({ label: t(`tools.listConverter.${key}`), value: delimiters[i] })),
  { label: t('tools.listConverter.custom'), value: 'custom' },
]);
const inputOptions = computed(() => [{ label: t('tools.listConverter.auto'), value: 'auto' }, ...options.value]);
const outputOptions = computed(() => [{ label: t('tools.listConverter.sameAsInput'), value: 'same' }, ...options.value]);

watch(() => props.inputSeparator, value => {
  const current = inputChoice.value === 'auto' ? undefined : inputChoice.value === 'custom' ? customInput.value : inputChoice.value;
  if (value === current) return;
  inputChoice.value = value === undefined ? 'auto' : delimiters.includes(value) ? value : 'custom';
  if (inputChoice.value === 'custom') customInput.value = value ?? '';
}, { immediate: true });
watch(() => props.outputSeparator, value => {
  const current = outputChoice.value === 'same' ? null : outputChoice.value === 'custom' ? customOutput.value : outputChoice.value;
  if (value === current) return;
  outputChoice.value = value === null ? 'same' : delimiters.includes(value) ? value : 'custom';
  if (outputChoice.value === 'custom') customOutput.value = value ?? '';
}, { immediate: true });
function updateInput(value: string) {
  inputChoice.value = value;
  emit('update:inputSeparator', value === 'auto' ? undefined : value === 'custom' ? customInput.value : value);
}
function updateOutput(value: string) {
  outputChoice.value = value;
  emit('update:outputSeparator', value === 'same' ? null : value === 'custom' ? customOutput.value : value);
}
function updateCustomInput(value: string) { customInput.value = value; emit('update:inputSeparator', value); }
function updateCustomOutput(value: string) { customOutput.value = value; emit('update:outputSeparator', value); }
</script>
<template>
  <div class="list-separators">
    <div class="list-separators__grid">
      <div class="list-separators__field"><span>{{ t('tools.listConverter.inputSeparator') }}</span><NSelect :value="inputChoice" :options="inputOptions" :aria-label="t('tools.listConverter.inputSeparator')" @update:value="updateInput" /></div>
      <div class="list-separators__field"><span>{{ t('tools.listConverter.outputSeparator') }}</span><NSelect :value="outputChoice" :options="outputOptions" :aria-label="t('tools.listConverter.outputSeparator')" @update:value="updateOutput" /></div>
    </div>
    <div v-if="inputChoice === 'custom' || outputChoice === 'custom'" class="list-separators__grid">
      <div v-if="inputChoice === 'custom'" class="list-separators__field"><span>{{ t('tools.listConverter.customInputSeparator') }}</span><NInput :value="customInput" :input-props="{ 'aria-label': t('tools.listConverter.customInputSeparator') }" @update:value="updateCustomInput" /></div>
      <div v-if="outputChoice === 'custom'" class="list-separators__field"><span>{{ t('tools.listConverter.customOutputSeparator') }}</span><NInput :value="customOutput" :input-props="{ 'aria-label': t('tools.listConverter.customOutputSeparator') }" @update:value="updateCustomOutput" /></div>
    </div>
    <NAlert v-if="inputChoice === 'custom' && !customInput" type="warning">{{ t('tools.listConverter.inputSeparatorRequired') }}</NAlert>
  </div>
</template>
<style scoped>
.list-separators { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.list-separators__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 12px 24px; }
.list-separators__field { display: flex; align-items: center; gap: 12px; min-width: 0; }
.list-separators__field > span { flex-shrink: 0; font-size: 13px; opacity: 0.6; }
.list-separators__field > :last-child { flex: 1; min-width: 0; }
</style>
