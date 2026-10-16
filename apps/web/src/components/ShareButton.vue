<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NModal, NInput, NSpace, NAlert, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useCopy } from '@/composables/useCopy';

const props = defineProps<{
  toolName: string;
  toolPath: string;
}>();

const { t } = useI18n();
const { copyToClipboard } = useCopy();

const showModal = ref(false);
const shareTitle = ref('');
const shareContent = ref('');
const shareUrl = ref('');
const sharing = ref(false);
const shareError = ref('');

function open(content: string) {
  shareContent.value = content;
  shareTitle.value = props.toolName;
  shareUrl.value = '';
  shareError.value = '';
  showModal.value = true;
}

async function createShare() {
  sharing.value = true;
  shareError.value = '';
  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: shareContent.value,
        title: shareTitle.value,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      shareUrl.value = `${window.location.origin}/reports/${json.data.id}`;
    }
  } catch {
    shareError.value = t('share.error');
  } finally {
    sharing.value = false;
  }
}

function copyLink() {
  copyToClipboard(shareUrl.value);
}

defineExpose({ open });
</script>

<template>
  <NButton size="small" @click="open('')">
    {{ t('share.button') }}
  </NButton>

  <NModal v-model:show="showModal" preset="dialog" :title="t('share.title')" style="max-width: 500px;">
    <NSpace vertical>
      <NAlert type="info" :title="t('share.warning')">
        {{ t('share.warningDesc') }}
      </NAlert>

      <div v-if="!shareUrl">
        <NInput
          v-model:value="shareTitle"
          :placeholder="t('share.titlePlaceholder')"
          style="margin-bottom: 8px;"
        />
        <NButton
          type="primary"
          :loading="sharing"
          @click="createShare"
          :disabled="!shareContent.trim()"
        >
          {{ t('share.create') }}
        </NButton>
      </div>

      <div v-else>
        <NInput :value="shareUrl" readonly>
          <template #suffix>
            <NButton text @click="copyLink">{{ t('tool.copy') }}</NButton>
          </template>
        </NInput>
        <NTag type="success" size="small" style="margin-top: 8px;">
          {{ t('share.created') }}
        </NTag>
      </div>

      <NAlert v-if="shareError" type="error">{{ shareError }}</NAlert>
    </NSpace>
  </NModal>
</template>
