<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSpace, NAlert, NSelect } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { formatSql, type SqlFormatOptions } from './sql-prettify.service';
import type { SqlLanguage } from 'sql-formatter';

const { t } = useI18n();
const tool = useCurrentTool();
const input = ref('');
const language = ref<SqlLanguage>('sql');
const keywordCase = ref<'upper' | 'lower' | 'preserve'>('upper');

const dialectOptions = [
  { label: 'SQL', value: 'sql' as SqlLanguage },
  { label: 'MySQL', value: 'mysql' as SqlLanguage },
  { label: 'MariaDB', value: 'mariadb' as SqlLanguage },
  { label: 'PostgreSQL', value: 'postgresql' as SqlLanguage },
  { label: 'SQLite', value: 'sqlite' as SqlLanguage },
  { label: 'T-SQL', value: 'tsql' as SqlLanguage },
  { label: 'PL/SQL', value: 'plsql' as SqlLanguage },
  { label: 'DB2', value: 'db2' as SqlLanguage },
  { label: 'Snowflake', value: 'snowflake' as SqlLanguage },
  { label: 'BigQuery', value: 'bigquery' as SqlLanguage },
  { label: 'Redshift', value: 'redshift' as SqlLanguage },
  { label: 'Trino', value: 'trino' as SqlLanguage },
];

const keywordCaseOptions = computed(() => [
  { label: 'UPPER', value: 'upper' as const },
  { label: 'lower', value: 'lower' as const },
  { label: t('tools.sqlPrettify.preserve'), value: 'preserve' as const },
]);

const options = computed<SqlFormatOptions>(() => ({
  language: language.value,
  keywordCase: keywordCase.value,
}));

const output = computed(() => formatSql(input.value, options.value).result);
const errorMsg = computed(() => formatSql(input.value, options.value).error);
</script>
<template>
  <ToolLayout v-if="tool" :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="output" :input-title="t('tools.sqlPrettify.inputTitle')" :output-title="t('tools.sqlPrettify.outputTitle')" export-name="output.sql">
      <template #input>
        <NInput
          v-model:value="input"
          type="textarea"
          :rows="10"
          placeholder="SELECT id, name FROM users WHERE active = 1 ORDER BY name"
          style="font-family: monospace;"
         :input-props="{ id: 'sqlPrettifyField0' }"/>
      </template>
      <template #output>
        <NInput
          :value="output"
          type="textarea"
          :rows="10"
          readonly
          :placeholder="t('tools.sqlPrettify.outputPlaceholder')"
          style="font-family: monospace;"
         :input-props="{ id: 'sqlPrettifyField1' }"/>
      </template>
      <template #params>
        <NSpace :size="16">
          <div>
            <div style="margin-bottom: 4px; font-weight: 500;">{{ t('tools.sqlPrettify.dialect') }}</div>
            <NSelect
              v-model:value="language"
              :options="dialectOptions"
              style="width: 200px;"
            />
          </div>
          <div>
            <div style="margin-bottom: 4px; font-weight: 500;">{{ t('tools.sqlPrettify.keywordCase') }}</div>
            <NSelect
              v-model:value="keywordCase"
              :options="keywordCaseOptions"
              style="width: 200px;"
            />
          </div>
        </NSpace>
        <NAlert v-if="errorMsg" type="error" :title="t('common.error')">
          {{ errorMsg }}
        </NAlert>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
