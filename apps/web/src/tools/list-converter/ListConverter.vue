<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NSelect, NSwitch, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
import { convertList } from './list-converter.service';

const { t } = useI18n();

const inputText = ref('apple, banana, apple, cherry, banana, date');

const separator = ref(',');
const separatorOptions = computed(() => [
  { label: t('tools.listConverter.comma'), value: ',' },
  { label: t('tools.listConverter.semicolon'), value: ';' },
  { label: t('tools.listConverter.newline'), value: '\n' },
  { label: t('tools.listConverter.tab'), value: '\t' },
  { label: t('tools.listConverter.pipe'), value: '|' },
  { label: t('tools.listConverter.space'), value: ' ' },
]);

const trimItems = ref(true);
const removeEmpty = ref(true);
const lowerCase = ref(false);
const removeDuplicates = ref(false);
const sortItems = ref<'none' | 'asc' | 'desc'>('none');
const sortOptions = computed(() => [
  { label: t('tools.listConverter.none'), value: 'none' },
  { label: t('tools.listConverter.ascending'), value: 'asc' },
  { label: t('tools.listConverter.descending'), value: 'desc' },
]);
const itemPrefix = ref('');
const itemSuffix = ref('');

const output = computed(() => {
  return convertList(inputText.value, {
    separator: separator.value,
    trimItems: trimItems.value,
    removeEmpty: removeEmpty.value,
    lowerCase: lowerCase.value,
    sortItems: sortItems.value,
    removeDuplicates: removeDuplicates.value,
    itemPrefix: itemPrefix.value,
    itemSuffix: itemSuffix.value,
  });
});

function copyOutput() {
  navigator.clipboard.writeText(output.value);
}
</script>

<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="16">
      <NCard :title="t('common.input')">
        <NInput
          v-model:value="inputText"
          type="textarea"
          :placeholder="t('tools.listConverter.inputPlaceholder')"
          :autosize="{ minRows: 4, maxRows: 10 }"
        />
      </NCard>

      <NCard :title="t('common.options')">
        <NSpace vertical :size="12">
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">{{ t('common.separator') }}</span>
            <NSelect v-model:value="separator" :options="separatorOptions" style="width: 200px;" />
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">{{ t('tools.listConverter.sortOrder') }}</span>
            <NSelect v-model:value="sortItems" :options="sortOptions" style="width: 200px;" />
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">{{ t('tools.listConverter.trimItems') }}</span>
            <NSwitch v-model:value="trimItems" />
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">{{ t('tools.listConverter.removeEmpty') }}</span>
            <NSwitch v-model:value="removeEmpty" />
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">{{ t('common.lowercase') }}</span>
            <NSwitch v-model:value="lowerCase" />
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">{{ t('tools.listConverter.removeDuplicates') }}</span>
            <NSwitch v-model:value="removeDuplicates" />
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">{{ t('tools.listConverter.itemPrefix') }}</span>
            <NInput v-model:value="itemPrefix" :placeholder="t('common.prefix')" clearable style="width: 200px;" />
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="width: 140px; font-size: 13px; opacity: 0.6; flex-shrink: 0;">{{ t('tools.listConverter.itemSuffix') }}</span>
            <NInput v-model:value="itemSuffix" :placeholder="t('common.suffix')" clearable style="width: 200px;" />
          </div>
        </NSpace>
      </NCard>

      <NCard :title="t('common.output')">
        <NSpace vertical :size="8">
          <NInput
            :value="output"
            type="textarea"
            readonly
            :autosize="{ minRows: 4, maxRows: 10 }"
          />
          <NButton @click="copyOutput" size="small">{{ t('tool.copy') }}</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
