<script setup lang="ts">
import { computed, ref } from 'vue';
import { NButton, NDatePicker, NInput, NPopover } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import TimeWheel from './TimeWheel.vue';
import { format } from 'date-fns';
const props = defineProps<{ value?: number | null; formattedValue?: string }>();
const emit = defineEmits<{ 'update:value': [number]; 'update:formattedValue': [string] }>();
const { t } = useI18n();
const show = ref(false);
const draft = ref(Date.now());
const selected = computed(() => props.formattedValue ? new Date(props.formattedValue).getTime() : props.value);
const display = computed(() => selected.value != null && Number.isFinite(selected.value) ? format(selected.value, 'yyyy-MM-dd HH:mm:ss') : '');
function open(value: boolean) {
  if (value) draft.value = selected.value != null && Number.isFinite(selected.value) ? selected.value : Date.now();
  show.value = value;
}
function setDate(value: number | null) {
  if (value === null) return;
  const date = new Date(draft.value), next = new Date(value);
  date.setFullYear(next.getFullYear(), next.getMonth(), next.getDate());
  draft.value = date.getTime();
}
const fields = ['hours', 'minutes', 'seconds'] as const;
function part(field: typeof fields[number]) {
  const d = new Date(draft.value);
  return field === 'hours' ? d.getHours() : field === 'minutes' ? d.getMinutes() : d.getSeconds();
}
function setTime(field: typeof fields[number], value: number) {
  const d = new Date(draft.value);
  if (field === 'hours') d.setHours(value); else if (field === 'minutes') d.setMinutes(value); else d.setSeconds(value);
  draft.value = d.getTime();
}
function confirm() {
  emit('update:value', draft.value);
  emit('update:formattedValue', format(draft.value, "yyyy-MM-dd'T'HH:mm:ss"));
  show.value = false;
}
</script>
<template>
  <NPopover :show="show" trigger="click" placement="bottom-start" :show-arrow="false" style="padding: 0; max-width: calc(100vw - 24px);" @update:show="open">
    <template #trigger><NInput :value="display" readonly :placeholder="t('tools.dateTime.dateTime')" :input-props="{ 'aria-label': t('tools.dateTime.dateTime'), 'aria-haspopup': 'dialog', 'aria-expanded': show }" /></template>
    <div role="dialog" :aria-label="t('tools.dateTime.dateTime')" class="datetime-popup">
      <div class="picker-columns">
        <NDatePicker :value="draft" type="date" panel :actions="[]" @update:value="setDate" />
        <div class="time-columns">
          <label v-for="field in fields" :key="field"><span>{{ t('common.' + field) }}</span>
            <TimeWheel :value="part(field)" :count="field === 'hours' ? 24 : 60" :label="t('common.' + field)" @update:value="setTime(field, $event)" />
          </label>
        </div>
      </div>
      <div class="picker-actions"><NButton size="small" @click="draft = Date.now()">{{ t('tools.dateTimeConverter.now') }}</NButton><NButton size="small" type="primary" @click="confirm">{{ t('tools.dateTime.confirm') }}</NButton></div>
    </div>
  </NPopover>
</template>
<style scoped>
.picker-columns { display: flex; align-items: stretch; overflow-x: auto; }
.picker-columns :deep(.n-date-panel) { box-shadow: none; }
.time-columns { display: flex; gap: 8px; padding: 12px; border-left: 1px solid var(--color-hairline); }
.time-columns label { display: grid; gap: 8px; text-align: center; color: var(--color-text-3); }
.picker-actions { display: flex; justify-content: flex-end; gap: 8px; padding: 10px 12px; border-top: 1px solid var(--color-hairline); }
</style>
