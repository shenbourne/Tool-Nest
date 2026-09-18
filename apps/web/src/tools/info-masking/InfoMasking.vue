<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NInput, NInputNumber, NSpace, NCheckbox, NCheckboxGroup, NButton, NDivider, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import { useCurrentTool } from '@/composables/useCurrentTool';
import { maskText, detectPatterns, MASK_PATTERNS, type MaskPattern } from './info-masking.service';

const { t } = useI18n();
const tool = useCurrentTool();

const inputText = ref(`Contact us at support@example.com or call +1-555-123-4567.
Server IP: 192.168.1.100
Payment card: 4111 1111 1111 1111
Alternative email: admin@company.org`);

const maskChar = ref('*');
const preserveFirst = ref(2);
const preserveLast = ref(2);

const enabledPatterns = ref<MaskPattern[]>(['email', 'phone', 'ip', 'creditCard']);
const enabledSet = computed(() => new Set(enabledPatterns.value));

const maskedOutput = computed(() =>
  maskText(inputText.value, {
    maskChar: maskChar.value || '*',
    enabledPatterns: enabledSet.value,
    preserveFirst: preserveFirst.value,
    preserveLast: preserveLast.value,
  })
);

const detectedPatterns = computed(() => detectPatterns(inputText.value));

function copyOutput() {
  navigator.clipboard.writeText(maskedOutput.value);
}
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <NCard title="Input Text">
        <NInput
          v-model:value="inputText"
          type="textarea"
          placeholder="Paste text containing sensitive information..."
          :autosize="{ minRows: 5, maxRows: 20 }"
        />
        <div v-if="detectedPatterns.length > 0" style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
          <span style="opacity: 0.6; font-size: 12px;">Detected:</span>
          <NTag v-for="d in detectedPatterns" :key="d.pattern.key" size="small" type="warning">
            {{ d.pattern.label }} ({{ d.count }})
          </NTag>
        </div>
      </NCard>

      <NCard title="Options">
        <NSpace vertical :size="12">
          <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <label>Mask character:</label>
              <NInput v-model:value="maskChar" style="width: 60px;" maxlength="1" />
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <label>Preserve first:</label>
              <NInputNumber v-model:value="preserveFirst" :min="0" :max="20" style="width: 80px;" />
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <label>Preserve last:</label>
              <NInputNumber v-model:value="preserveLast" :min="0" :max="20" style="width: 80px;" />
            </div>
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Patterns to mask:</label>
            <NCheckboxGroup v-model:value="enabledPatterns">
              <NSpace>
                <NCheckbox v-for="p in MASK_PATTERNS" :key="p.key" :value="p.key" :label="p.label" />
              </NSpace>
            </NCheckboxGroup>
          </div>
        </NSpace>
      </NCard>

      <NCard title="Masked Output">
        <template #header-extra>
          <NButton size="small" @click="copyOutput">{{ t('tool.copy') }}</NButton>
        </template>
        <NInput
          :value="maskedOutput"
          type="textarea"
          readonly
          :autosize="{ minRows: 5, maxRows: 20 }"
          style="font-family: monospace;"
        />
      </NCard>

      <NDivider />

      <NCard title="Before / After Comparison">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <h4 style="margin-bottom: 8px; opacity: 0.7;">Before</h4>
            <pre style="white-space: pre-wrap; word-break: break-all; font-family: monospace; font-size: 13px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 6px;">{{ inputText }}</pre>
          </div>
          <div>
            <h4 style="margin-bottom: 8px; opacity: 0.7;">After</h4>
            <pre style="white-space: pre-wrap; word-break: break-all; font-family: monospace; font-size: 13px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 6px;">{{ maskedOutput }}</pre>
          </div>
        </div>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
