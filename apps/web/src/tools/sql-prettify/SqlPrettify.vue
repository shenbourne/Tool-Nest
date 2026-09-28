<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NButton, NAlert, NSelect } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCopy } from '@/composables/useCopy';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { formatSql, type SqlFormatOptions } from './sql-prettify.service';
import type { SqlLanguage } from 'sql-formatter';

const { t } = useI18n();
const { copyToClipboard } = useCopy();
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

function copyOutput() {
  copyToClipboard(output.value);
}
</script>
<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NAlert v-if="errorMsg" type="error" :title="t('common.error')">
        {{ errorMsg }}
      </NAlert>
      <NCard :title="t('common.settings')">
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
      </NCard>
      <NCard :title="t('tools.sqlPrettify.inputTitle')">
        <NSpace vertical :size="12">
          <NInput
            v-model:value="input"
            type="textarea"
            :rows="10"
            placeholder="SELECT id, name FROM users WHERE active = 1 ORDER BY name"
            style="font-family: monospace;"
           :input-props="{ id: 'sqlPrettifyField0' }"/>
        </NSpace>
      </NCard>
      <NCard :title="t('tools.sqlPrettify.outputTitle')">
        <NSpace vertical :size="12">
          <NInput
            :value="output"
            type="textarea"
            :rows="10"
            readonly
            :placeholder="t('tools.sqlPrettify.outputPlaceholder')"
            style="font-family: monospace;"
           :input-props="{ id: 'sqlPrettifyField1' }"/>
          <NButton :disabled="!output" @click="copyOutput">
            {{ t('tool.copy') }}
          </NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
