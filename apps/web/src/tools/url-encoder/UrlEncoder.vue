<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NSpace, NDivider, NAlert } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
import { tool } from './index';
const { t } = useI18n();

// --- Text → Encoded ---
const plainInput = ref('https://example.com/path?q=hello world&lang=en');
const encoded = computed(() => encodeURIComponent(plainInput.value));

// --- Encoded → Text ---
const encodedInput = ref('');
const decoded = computed(() => { try { return decodeURIComponent(encodedInput.value); } catch { return ''; } });
// A rejected decode must not look identical to an empty decode result.
const decodeError = computed(() => {
  try { decodeURIComponent(encodedInput.value); return ''; } catch { return t('tools.urlEncoder.invalidEncoding'); }
});
</script>
<template>
  <ToolLayout :tool="tool">
    <NSpace vertical :size="12" class="url-encoder">
      <ToolTextPanel v-model:input-text="plainInput" :output-text="encoded" :input-title="t('tools.urlEncoder.inputEncode')" :output-title="t('common.output')" export-name="encoded.txt">
        <template #input>
          <NInput v-model:value="plainInput" type="textarea" :rows="3" :placeholder="t('tools.urlEncoder.inputPlaceholder')" :input-props="{ id: 'urlEncoderField0' }" />
        </template>
        <template #output>
          <NInput :value="encoded" type="textarea" :rows="3" readonly :placeholder="t('tools.urlEncoder.encoded')" :input-props="{ id: 'urlEncoderField1' }" />
        </template>
      </ToolTextPanel>

      <NDivider style="margin: 0 0 12px 0;" />

      <ToolTextPanel v-model:input-text="encodedInput" :output-text="decoded" :input-title="t('tools.urlEncoder.inputDecode')" :output-title="t('common.output')" export-name="decoded.txt">
        <template #input>
          <NInput v-model:value="encodedInput" type="textarea" :rows="3" :placeholder="t('tools.urlEncoder.encoded')" :input-props="{ id: 'urlEncoderField2' }" />
        </template>
        <template #output>
          <NInput :value="decoded" type="textarea" :rows="3" readonly :placeholder="t('tools.urlEncoder.decoded')" :input-props="{ id: 'urlEncoderField3' }" />
        </template>
        <template #params>
          <NAlert v-if="decodeError" type="error" :title="decodeError" />
        </template>
      </ToolTextPanel>
    </NSpace>
  </ToolLayout>
</template>
