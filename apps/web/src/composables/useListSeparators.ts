import { computed, ref, type Ref } from 'vue';
import { resolveOutputSeparator, splitListInput } from '@/utils/list-input';

export function useListSeparators(input: Ref<string>) {
  const inputSeparator = ref<string>();
  const outputSeparator = ref<string | null>(null);
  const items = computed(() => splitListInput(input.value, inputSeparator.value));
  function formatOutput(values: string[]): string {
    if (inputSeparator.value === '') return '';
    return values.join(resolveOutputSeparator(input.value, inputSeparator.value, outputSeparator.value));
  }
  return { inputSeparator, outputSeparator, items, formatOutput };
}
