<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NSpace, NTag, NDataTable } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { tool } from './index';
const { t } = useI18n();
const codes: Record<number, [string, string]> = {
  100:['Continue','info'],101:['Switching Protocols','info'],102:['Processing','info'],103:['Early Hints','info'],
  200:['OK','success'],201:['Created','success'],202:['Accepted','success'],204:['No Content','success'],206:['Partial Content','success'],
  301:['Moved Permanently','warning'],302:['Found','warning'],304:['Not Modified','warning'],307:['Temporary Redirect','warning'],308:['Permanent Redirect','warning'],
  400:['Bad Request','error'],401:['Unauthorized','error'],403:['Forbidden','error'],404:['Not Found','error'],405:['Method Not Allowed','error'],408:['Request Timeout','error'],409:['Conflict','error'],410:['Gone','error'],413:['Payload Too Large','error'],414:['URI Too Long','error'],415:['Unsupported Media Type','error'],422:['Unprocessable Entity','error'],429:['Too Many Requests','error'],
  500:['Internal Server Error','error'],501:['Not Implemented','error'],502:['Bad Gateway','error'],503:['Service Unavailable','error'],504:['Gateway Timeout','error'],
};
const search = ref('');
const filtered = computed(() => Object.entries(codes).filter(([code, [desc]]) => !search.value || code.includes(search.value) || desc.toLowerCase().includes(search.value.toLowerCase())));
const columns = computed(() => [
  { title: t('tools.httpStatus.code'), key: 'code', width: 100 },
  { title: t('tools.httpStatus.descriptionColumn'), key: 'desc' },
  { title: t('tools.httpStatus.class'), key: 'class' },
]);
const data = computed(() => filtered.value.map(([code, [desc, type]]) => ({ code, desc, class: type, type })));
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <NInput v-model:value="search" :placeholder="t('tools.httpStatus.searchPlaceholder')" clearable  :input-props="{ id: 'httpStatusField0' }"/>
      <NDataTable :columns="columns" :data="data" :bordered="false" :row-class-name="(row:any)=>row.type" size="small" />
    </NSpace></NCard>
  </ToolLayout>
</template>
