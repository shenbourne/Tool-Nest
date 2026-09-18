<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NInputNumber, NSpace, NButton, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { arabicToRoman, romanToArabic, isValidRomanNumber, MIN_ARABIC_TO_ROMAN, MAX_ARABIC_TO_ROMAN } from './roman-numeral-converter.service';

const { t } = useI18n();
const tool = useCurrentTool();

const inputArabic = ref(42);
const outputRoman = computed(() => arabicToRoman(inputArabic.value));

const inputRoman = ref('XLII');
const outputArabic = computed(() => romanToArabic(inputRoman.value));
const romanValid = computed(() => isValidRomanNumber(inputRoman.value));

const arabicValid = computed(() => inputArabic.value >= MIN_ARABIC_TO_ROMAN && inputArabic.value <= MAX_ARABIC_TO_ROMAN);

function copyRoman() {
  if (outputRoman.value) navigator.clipboard.writeText(outputRoman.value);
}
function copyArabic() {
  if (outputArabic.value !== null) navigator.clipboard.writeText(String(outputArabic.value));
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Arabic → Roman">
        <NSpace align="center" :size="16" justify="space-between">
          <NInputNumber v-model:value="inputArabic" :min="MIN_ARABIC_TO_ROMAN" :max="MAX_ARABIC_TO_ROMAN" style="width: 200px" :show-button="false" />
          <span style="font-size: 22px;">{{ outputRoman }}</span>
          <NButton :disabled="!arabicValid" @click="copyRoman">{{ t('tool.copy') }}</NButton>
        </NSpace>
        <NAlert v-if="!arabicValid" type="warning" style="margin-top: 8px;">
          {{ MIN_ARABIC_TO_ROMAN }} - {{ MAX_ARABIC_TO_ROMAN }}
        </NAlert>
      </NCard>

      <NCard title="Roman → Arabic">
        <NSpace align="center" :size="16" justify="space-between">
          <NInput v-model:value="inputRoman" style="width: 200px" placeholder="e.g. XLII" />
          <span style="font-size: 22px;">{{ outputArabic }}</span>
          <NButton :disabled="!romanValid" @click="copyArabic">{{ t('tool.copy') }}</NButton>
        </NSpace>
        <NAlert v-if="inputRoman && !romanValid" type="error" style="margin-top: 8px;">
          Invalid roman numeral
        </NAlert>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
