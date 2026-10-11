<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSelect, NSwitch } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
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
          <div class="list-options__fields">
            <div class="list-options__field">
              <span class="list-options__label">{{ t('common.separator') }}</span>
              <NSelect v-model:value="separator" :options="separatorOptions" class="list-options__control" />
            </div>
            <div class="list-options__field">
              <span class="list-options__label">{{ t('tools.listConverter.sortOrder') }}</span>
              <NSelect v-model:value="sortItems" :options="sortOptions" class="list-options__control" />
            </div>
          </div>
          <div class="list-options__switches">
            <div class="list-options__field">
              <span class="list-options__label">{{ t('tools.listConverter.trimItems') }}</span>
              <NSwitch v-model:value="trimItems" />
            </div>
            <div class="list-options__field">
              <span class="list-options__label">{{ t('tools.listConverter.removeEmpty') }}</span>
              <NSwitch v-model:value="removeEmpty" />
            </div>
            <div class="list-options__field">
              <span class="list-options__label">{{ t('common.lowercase') }}</span>
              <NSwitch v-model:value="lowerCase" />
            </div>
            <div class="list-options__field">
              <span class="list-options__label">{{ t('tools.listConverter.removeDuplicates') }}</span>
              <NSwitch v-model:value="removeDuplicates" />
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
