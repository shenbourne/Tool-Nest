<script setup lang="ts">
import { computed,ref } from 'vue';
import { useRoute,useRouter } from 'vue-router';
import { NInput,NSelect } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import ToolTabs from '@/components/ToolTabs.vue';
import { tool } from './index';
import { jsonOperations,processJson,resolveJsonEditorOperation } from './json-tools.service';
const {t}=useI18n();
const route=useRoute();
const router=useRouter();
const input=ref('');
const indent=ref<number|'tab'>(2);
const operation=computed({get:()=>resolveJsonEditorOperation(route.query.operation),set:value=>{void router.replace({query:{...route.query,operation:value},hash:route.hash});}});
const tabs=computed(()=>jsonOperations.filter(name=>name!=='validate').map(name=>({name,label:t(`tools.jsonTools.${name}`)})));
function selectOperation(value:string) { operation.value=resolveJsonEditorOperation(value); }
const indentOptions=computed(()=>[{label:t('tools.jsonPrettify.tab'),value:'tab'},...Array.from({length:8},(_,i)=>({label:t('tools.jsonPrettify.spaces',{count:i+1}),value:i+1}))]);
const result=computed(()=>processJson(input.value,operation.value,indent.value));
const validation=computed(()=>processJson(input.value,'validate'));
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="result.output" :input-title="t('common.input')" :output-title="t('common.output')" :export-name="operation==='escape' || operation==='unescape' ? 'output.txt' : 'output.json'" stack-on-mobile wrap-actions>
      <template #input><NInput v-model:value="input" type="textarea" :rows="12" :placeholder="t('common.inputPlaceholder')" :input-props="{'aria-label':t('common.input')}" /></template>
      <template #output><NInput :value="result.output" type="textarea" :rows="12" readonly :placeholder="t('common.outputPlaceholder')" :input-props="{'aria-label':t('common.output')}" /></template>
      <template #params>
        <div class="json-validation" :class="{'is-valid':validation.valid===true,'is-invalid':validation.valid===false}" role="status" aria-live="polite">
          <span class="json-validation-label"><span aria-hidden="true">{{ validation.valid===true ? '✓' : validation.valid===false ? '×' : '—' }}</span>{{ validation.valid===true ? t('tools.jsonValidate.valid') : validation.valid===false ? t('common.invalidJson') : t('tools.jsonTools.awaitingValidation') }}</span>
          <span v-if="validation.error" class="json-validation-detail">{{ validation.error }}</span>
        </div>
        <ToolTabs :value="operation" :tabs="tabs" :aria-label="t('tools.jsonTools.operation')" @update:value="selectOperation">
        <div class="json-controls">
          <label><span>{{ t('common.indent') }}</span><NSelect v-model:value="indent" :options="indentOptions" :aria-label="t('common.indent')" /></label>
        </div>
        </ToolTabs>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>
<style scoped>
.json-controls {display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px;}
.json-validation {display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px;font-size:12px;color:var(--color-ink-muted);}
.json-validation-label {display:flex;align-items:center;gap:6px;}
.json-validation-detail {min-width:0;overflow-wrap:anywhere;}
.json-validation.is-valid {color:var(--color-success);}
.json-validation.is-invalid {color:var(--color-error);}
.json-controls label {display:grid;gap:6px;flex:1 1 180px;min-width:0;max-width:320px;}
@media(max-width:600px){.json-controls label{max-width:none;flex-basis:100%;}}
</style>
