<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';

const { t } = useI18n();
const { copyToClipboard } = useCopy();

const input = ref('hello world example');

function toWords(s: string): string[] {
  return s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_\-./\\]+/g, ' ').trim().split(/\s+/).filter(Boolean);
}

const camelCase = computed(() => { const w = toWords(input.value); return w.map((w,i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()).join(''); });
const pascalCase = computed(() => toWords(input.value).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(''));
const snakeCase = computed(() => toWords(input.value).map(w => w.toLowerCase()).join('_'));
const kebabCase = computed(() => toWords(input.value).map(w => w.toLowerCase()).join('-'));
const upperCase = computed(() => toWords(input.value).map(w => w.toUpperCase()).join(' '));
const lowerCase = computed(() => input.value.toLowerCase());
const titleCase = computed(() => toWords(input.value).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' '));
const constantCase = computed(() => toWords(input.value).map(w => w.toUpperCase()).join('_'));

const results = [
  { label: 'camelCase', value: camelCase },
  { label: 'PascalCase', value: pascalCase },
  { label: 'snake_case', value: snakeCase },
  { label: 'kebab-case', value: kebabCase },
  { label: 'UPPER CASE', value: upperCase },
  { label: 'lower case', value: lowerCase },
  { label: 'Title Case', value: titleCase },
  { label: 'CONSTANT_CASE', value: constantCase },
];

function copyText(text: string) { copyToClipboard(text); }
</script>

<template>
  <ToolLayout :tool="tool">
    <NCard>
      <NSpace vertical :size="12">
        <NInput v-model:value="input" :placeholder="t('tools.caseConverter.inputPlaceholder')"  :input-props="{ id: 'caseConverterField0' }"/>
        <div v-for="r in results" :key="r.label" style="display: flex; align-items: center; gap: 12px;">
          <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">{{ r.label }}</span>
          <NInput :value="r.value.value" readonly style="flex: 1;" @click="copyText(r.value.value)"  :input-props="{ id: 'caseConverterField1' }"/>
        </div>
      </NSpace>
    </NCard>
  </ToolLayout>
</template>
