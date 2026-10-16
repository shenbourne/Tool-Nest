<script setup lang="ts">
import { computed, ref } from 'vue';
import { NInput } from 'naive-ui';
// Editable text field that keeps a local draft while focused, so intermediate
// (possibly invalid) input is not lost and the cursor does not jump when the
// parent normalizes the URL. The draft is discarded on blur, reverting to the
// last committed value.
const props = defineProps<{
  value: string;
  placeholder?: string;
  inputId?: string;
}>();
const emit = defineEmits<{ (e: 'commit', value: string): void }>();
const draft = ref<string | null>(null);
const shown = computed(() => (draft.value !== null ? draft.value : props.value));
function onUpdate(v: string) {
  draft.value = v;
  emit('commit', v);
}
function onBlur() {
  draft.value = null;
}
</script>
<template>
  <NInput
    :value="shown"
    :placeholder="placeholder"
    size="small"
    :input-props="{ id: inputId }"
    @update:value="onUpdate"
    @blur="onBlur"
  />
</template>
