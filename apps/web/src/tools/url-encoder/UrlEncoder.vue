<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
const { t } = useI18n();
const input = ref('https://example.com/path?q=hello world&lang=en');
const encoded = computed(() => { try { return encodeURIComponent(input.value); } catch { return ''; } });
const decoded = computed(() => { try { return decodeURIComponent(input.value); } catch { return ''; } });
// A rejected decode must not look identical to an empty decode result.
const decodeError = computed(() => {
  try { decodeURIComponent(input.value); return ''; } catch { return t('tools.urlEncoder.invalidEncoding'); }
});
</script>
<template>
  <ToolLayout :tool="tool">
    <ToolTextPanel v-model:input-text="input" :output-text="encoded" :input-title="t('common.input')" :output-title="t('common.encode')" export-name="encoded.txt">
      <template #input>
        <NInput v-model:value="input" type="textarea" :rows="3" :placeholder="t('tools.urlEncoder.inputPlaceholder')"  :input-props="{ id: 'urlEncoderField0' }"/>
      </template>
      <template #output>
        <NInput :value="encoded" readonly  :input-props="{ id: 'urlEncoderField1' }"/>
      </template>
      <template #params>
        <div class="url-encoder__decoded">
          <span class="url-encoder__label">{{ t('common.decode') }}</span>
          <NInput :value="decoded" readonly  :input-props="{ id: 'urlEncoderField2' }"/>
          <NAlert v-if="decodeError" type="error" :title="decodeError" />
        </div>
      </template>
    </ToolTextPanel>
  </ToolLayout>
</template>

<style scoped>
.url-encoder__decoded {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.url-encoder__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
}
</style>
