<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NButton, NAlert, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { tool } from './index';

const { t } = useI18n();
const file = ref<File | null>(null);
const processing = ref(false);
const error = ref('');
const hasSignatures = ref(false);
const signatureCount = ref(0);
const fieldNames = ref<string[]>([]);
const checked = ref(false);

function onFile(files: File[]) {
  const f = files[0] ?? null;
  file.value = f;
  checked.value = false;
  error.value = '';
}

async function checkSignatures() {
  if (!file.value) return;
  processing.value = true;
  error.value = '';
  checked.value = false;
  hasSignatures.value = false;
  signatureCount.value = 0;
  fieldNames.value = [];
  try {
    const { PDFDocument, PDFSignature } = await import('pdf-lib');
    const buf = await file.value.arrayBuffer();
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const form = doc.getForm();
    const fields = form.getFields();
    const sigFields = fields.filter((field) => field instanceof PDFSignature);
    signatureCount.value = sigFields.length;
    hasSignatures.value = sigFields.length > 0;
    fieldNames.value = sigFields.map((field) => field.getName());
    checked.value = true;
  } catch (e: any) {
    error.value = e.message || t('tools.pdfSignatureChecker.failed');
  }
  processing.value = false;
}
</script>
<template>
  <ToolLayout :tool="tool">
    <NCard><NSpace vertical :size="12">
      <ToolFileUpload accept=".pdf" @change="onFile" />
      <NButton type="primary" :loading="processing" @click="checkSignatures" :disabled="!file">
        {{ t('tools.pdfSignatureChecker.check') }}
      </NButton>
      <NAlert v-if="error" type="error" :title="error" />
      <NAlert v-if="checked && !error" :type="hasSignatures ? 'success' : 'warning'">
        <template #header>
          {{ hasSignatures ? t('tools.pdfSignatureChecker.signaturesFound') : t('tools.pdfSignatureChecker.noSignatures') }}
        </template>
        <p>{{ t('tools.pdfSignatureChecker.signatureFields', { count: signatureCount }) }}</p>
        <NSpace v-if="fieldNames.length">
          <NTag v-for="name in fieldNames" :key="name" type="info">{{ name }}</NTag>
        </NSpace>
      </NAlert>
    </NSpace></NCard>
  </ToolLayout>
</template>
