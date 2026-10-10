<script setup lang="ts">
import { ref, computed } from 'vue';
import { NInput, NInputNumber, NSpace, NCheckbox, NCheckboxGroup, NCard, NDivider, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolTextPanel from '@/components/ToolTextPanel.vue';
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
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <NSpace vertical :size="16">
      <ToolTextPanel v-model:input-text="inputText" :output-text="maskedOutput" :input-title="t('tools.infoMasking.inputText')" :output-title="t('tools.infoMasking.maskedOutput')" export-name="masked.txt">
        <template #input>
          <NInput
            v-model:value="inputText"
            type="textarea"
            :placeholder="t('tools.infoMasking.pasteSensitivePlaceholder')"
            :autosize="{ minRows: 5, maxRows: 20 }"
           :input-props="{ id: 'infoMaskingField0' }"/>
        </template>
        <template #output>
          <NInput
            :value="maskedOutput"
            type="textarea"
            readonly
            :autosize="{ minRows: 5, maxRows: 20 }"
            style="font-family: monospace;"
           :input-props="{ id: 'infoMaskingField4' }"/>
        </template>
        <template #params>
          <div v-if="detectedPatterns.length > 0" style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <span style="opacity: 0.6; font-size: 12px;">{{ t('tools.infoMasking.detected') }}</span>
            <NTag v-for="d in detectedPatterns" :key="d.pattern.key" size="small" type="warning">
              {{ t(d.pattern.labelKey) }} ({{ d.count }})
            </NTag>
          </div>
          <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <label :for="'infoMaskingField1'">{{ t('tools.infoMasking.maskCharacter') }}</label>
              <NInput v-model:value="maskChar" style="width: 60px;" maxlength="1"  :input-props="{ id: 'infoMaskingField1' }"/>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <label :for="'infoMaskingField2'">{{ t('tools.infoMasking.preserveFirst') }}</label>
              <NInputNumber v-model:value="preserveFirst" :min="0" :max="20" style="width: 80px;"  :input-props="{ id: 'infoMaskingField2' }"/>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <label :for="'infoMaskingField3'">{{ t('tools.infoMasking.preserveLast') }}</label>
              <NInputNumber v-model:value="preserveLast" :min="0" :max="20" style="width: 80px;"  :input-props="{ id: 'infoMaskingField3' }"/>
            </div>
          </div>
          <div>
            <span style="display: block; margin-bottom: 8px; font-weight: 500;">{{ t('tools.infoMasking.patternsToMask') }}</span>
            <NCheckboxGroup v-model:value="enabledPatterns">
              <NSpace>
                <NCheckbox v-for="p in MASK_PATTERNS" :key="p.key" :value="p.key" :label="t(p.labelKey)" />
              </NSpace>
            </NCheckboxGroup>
          </div>
        </template>
      </ToolTextPanel>

      <NDivider />

      <NCard :title="t('tools.infoMasking.comparison')">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <h4 style="margin-bottom: 8px; opacity: 0.7;">{{ t('tools.infoMasking.before') }}</h4>
            <pre style="white-space: pre-wrap; word-break: break-all; font-family: monospace; font-size: 13px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 6px;">{{ inputText }}</pre>
          </div>
          <div>
            <h4 style="margin-bottom: 8px; opacity: 0.7;">{{ t('tools.infoMasking.after') }}</h4>
            <pre style="white-space: pre-wrap; word-break: break-all; font-family: monospace; font-size: 13px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 6px;">{{ maskedOutput }}</pre>
          </div>
        </div>
      </NCard>
    </NSpace>
  </ToolLayout>
</template>
