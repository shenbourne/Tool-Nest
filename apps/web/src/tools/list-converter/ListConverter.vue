<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSelect, NSwitch } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
import ListSeparators from '@/components/ListSeparators.vue';
import { useListSeparators } from '@/composables/useListSeparators';
import { convertList, DEFAULT_LIST_OPTIONS } from './list-converter.service';

const { t } = useI18n();

const inputText = ref('apple, banana, apple, cherry, banana, date');

const { inputSeparator, outputSeparator } = useListSeparators(inputText);

const trimItems = ref(DEFAULT_LIST_OPTIONS.trimItems);
const removeEmpty = ref(DEFAULT_LIST_OPTIONS.removeEmpty);
const lowerCase = ref(DEFAULT_LIST_OPTIONS.lowerCase);
const removeDuplicates = ref(DEFAULT_LIST_OPTIONS.removeDuplicates);
const sortItems = ref<'none' | 'asc' | 'desc'>(DEFAULT_LIST_OPTIONS.sortItems);
const sortOptions = computed(() => [
  { label: t('tools.listConverter.none'), value: 'none' },
  { label: t('tools.listConverter.ascending'), value: 'asc' },
  { label: t('tools.listConverter.descending'), value: 'desc' },
]);
const itemPrefix = ref(DEFAULT_LIST_OPTIONS.itemPrefix);
const itemSuffix = ref(DEFAULT_LIST_OPTIONS.itemSuffix);

const output = computed(() => {
  if (inputSeparator.value === '') return '';
  return convertList(inputText.value, {
    inputSeparator: inputSeparator.value,
    separator: outputSeparator.value,
    trimItems: trimItems.value,
    removeEmpty: removeEmpty.value,
    lowerCase: lowerCase.value,
    sortItems: sortItems.value,
    removeDuplicates: removeDuplicates.value,
    itemPrefix: itemPrefix.value,
    itemSuffix: itemSuffix.value,
  });
});
</script>

<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="inputText" :output-text="output" :input-title="t('common.input')" :output-title="t('common.output')" export-name="output.txt">
      <template #input>
        <NInput
          v-model:value="inputText"
          type="textarea"
          :placeholder="t('tools.listConverter.inputPlaceholder')"
          :autosize="{ minRows: 4, maxRows: 10 }"
         :input-props="{ id: 'listConverterField0' }"/>
      </template>
      <template #output>
        <NInput
          :value="output"
          type="textarea"
          readonly
          :autosize="{ minRows: 4, maxRows: 10 }"
         :input-props="{ id: 'listConverterField3' }"/>
      </template>
      <template #params>
        <div class="list-options">
          <ListSeparators v-model:input-separator="inputSeparator" v-model:output-separator="outputSeparator" />
          <div class="list-options__fields">
            <div class="list-options__field">
              <span class="list-options__label">{{ t('tools.listConverter.sortOrder') }}</span>
              <NSelect v-model:value="sortItems" :options="sortOptions" :aria-label="t('tools.listConverter.sortOrder')" class="list-options__control" />
            </div>
          </div>
          <div class="list-options__switches">
            <div class="list-options__field">
              <span class="list-options__label">{{ t('tools.listConverter.trimItems') }}</span>
              <NSwitch v-model:value="trimItems" :aria-label="t('tools.listConverter.trimItems')" />
            </div>
            <div class="list-options__field">
              <span class="list-options__label">{{ t('tools.listConverter.removeEmpty') }}</span>
              <NSwitch v-model:value="removeEmpty" :aria-label="t('tools.listConverter.removeEmpty')" />
            </div>
            <div class="list-options__field">
              <span class="list-options__label">{{ t('common.lowercase') }}</span>
              <NSwitch v-model:value="lowerCase" :aria-label="t('common.lowercase')" />
            </div>
            <div class="list-options__field">
              <span class="list-options__label">{{ t('tools.listConverter.removeDuplicates') }}</span>
              <NSwitch v-model:value="removeDuplicates" :aria-label="t('tools.listConverter.removeDuplicates')" />
            </div>
          </div>
          <div class="list-options__fields">
            <div class="list-options__field">
              <span class="list-options__label">{{ t('tools.listConverter.itemPrefix') }}</span>
              <NInput v-model:value="itemPrefix" :placeholder="t('common.prefix')" clearable class="list-options__control"  :input-props="{ id: 'listConverterField1' }"/>
            </div>
            <div class="list-options__field">
              <span class="list-options__label">{{ t('tools.listConverter.itemSuffix') }}</span>
              <NInput v-model:value="itemSuffix" :placeholder="t('common.suffix')" clearable class="list-options__control"  :input-props="{ id: 'listConverterField2' }"/>
            </div>
          </div>
        </div>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>

<style scoped>
.list-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-options__fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 12px 24px;
}

.list-options__field {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.list-options__label {
  font-size: 13px;
  opacity: 0.6;
  flex-shrink: 0;
}

.list-options__control {
  flex: 1;
  min-width: 0;
}

.list-options__switches {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 32px;
}
</style>
