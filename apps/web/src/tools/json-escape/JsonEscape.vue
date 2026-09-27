<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NSwitch } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';

const { t } = useI18n();

const input = ref('');
const mode = ref<'escape'|'unescape'>('escape');
const output = computed(() => {
  try {
    if (mode.value === 'escape') return JSON.stringify(input.value);
    // Unescaping a non-string JSON value (number, boolean, object) must not
    // render as [object Object]; present its JSON text instead.
    const parsed = JSON.parse(input.value);
    return typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
  } catch { return t('tools.jsonEscape.invalidInput'); }
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NSwitch :value="mode === 'escape'" @update:value="mode = $event ? 'escape' : 'unescape'">{{ t('tools.jsonEscape.toggle') }}</NSwitch>
      <NInput v-model:value="input" type="textarea" :rows="6" :placeholder="mode === 'escape' ? t('tools.jsonEscape.escapePlaceholder') : t('tools.jsonEscape.unescapePlaceholder')" />
      <NInput :value="output" type="textarea" :rows="6" readonly :placeholder="t('common.outputPlaceholder')" />
    </NSpace></NCard>
  </ToolLayout>
</template>
