<script setup lang="ts">
import { computed, ref } from 'vue';
import { NUpload, NUploadDragger, NIcon } from 'naive-ui';
import type { UploadFileInfo } from 'naive-ui';
import { CloudUpload } from '@vicons/tabler';
import { useI18n } from 'vue-i18n';

const props = withDefaults(defineProps<{
  accept?: string;
  multiple?: boolean;
}>(), {
  accept: '',
  multiple: false,
});

const emit = defineEmits<{ change: [files: File[]] }>();

const { t } = useI18n();
const fileList = ref<UploadFileInfo[]>([]);

const files = computed(() =>
  fileList.value.map((item) => item.file).filter((f): f is File => f !== null),
);

function emitFiles() {
  emit('change', files.value);
}

// naive-ui appends every pick to the list, so single-file tools keep only the newest entry.
function onUpdate(list: UploadFileInfo[]) {
  fileList.value = props.multiple ? list : list.slice(-1);
  emitFiles();
}

function remove(index: number) {
  fileList.value = fileList.value.filter((_, i) => i !== index);
  emitFiles();
}
</script>

<template>
  <div class="tool-file-upload">
    <NUpload
      :file-list="fileList"
      :accept="accept"
      :multiple="multiple"
      :default-upload="false"
      :show-file-list="false"
      @update:file-list="onUpdate"
    >
      <NUploadDragger>
        <div class="tool-file-upload__body">
          <NIcon :size="26" :component="CloudUpload" class="tool-file-upload__icon" />
          <p class="tool-file-upload__label">
            {{ files.length ? t('tool.fileUpload.replace') : t('tool.fileUpload.choose') }}
          </p>
          <p v-if="accept" class="tool-file-upload__hint">
            {{ t('tool.fileUpload.accepted', { types: accept }) }}
          </p>
        </div>
      </NUploadDragger>
    </NUpload>

    <ul v-if="fileList.length" class="tool-file-upload__files">
      <li v-for="(item, index) in fileList" :key="item.id" class="tool-file-upload__file">
        <span class="tool-file-upload__name" :title="item.name">{{ item.name }}</span>
        <button type="button" class="tool-file-upload__remove" @click="remove(index)">
          {{ t('common.remove') }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tool-file-upload__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xxs);
}

.tool-file-upload__icon {
  color: var(--color-primary);
}

.tool-file-upload__label {
  margin: 0;
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-ink);
}

.tool-file-upload__hint {
  margin: 0;
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
}

.tool-file-upload__files {
  list-style: none;
  margin: var(--spacing-xs) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
}

.tool-file-upload__file {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-height: 42px;
  padding: 0 var(--spacing-sm);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  background: var(--color-surface-soft);
}

.tool-file-upload__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--font-size-body-sm);
  color: var(--color-ink);
}

.tool-file-upload__remove {
  flex: none;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
}

.tool-file-upload__remove:hover {
  color: var(--color-error);
}
</style>
