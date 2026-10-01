<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { NUpload, NUploadDragger, NIcon, useMessage } from 'naive-ui';
import type { UploadFileInfo } from 'naive-ui';
import { CloudUpload } from '@vicons/tabler';
import { useI18n } from 'vue-i18n';
import { collectClipboardFiles, splitByAccept } from '@/utils/clipboard-files';
import { thumbnailKind } from '@/utils/file-thumbnail';
import { renderThumbnailDataUrl } from '@/utils/thumbnail-render';
import FileCard from '@/components/FileCard.vue';

const props = withDefaults(defineProps<{
  accept?: string;
  multiple?: boolean;
  compact?: boolean;
  removable?: boolean;
}>(), {
  accept: '',
  multiple: false,
  compact: false,
  removable: true,
});

const emit = defineEmits<{ change: [files: File[]] }>();

const { t } = useI18n();
const message = useMessage();
const fileList = ref<UploadFileInfo[]>([]);

const files = computed(() =>
  fileList.value.map((item) => item.file).filter((f): f is File => f !== null),
);

// Thumbnails are keyed by list-entry id and cached for the entry's lifetime;
// they are data URLs, so nothing here needs revoking on removal.
const thumbnails = ref<Record<string, string>>({});
const rendering = new Set<string>();

async function ensureThumbnail(item: UploadFileInfo) {
  const file = item.file;
  if (!file || thumbnails.value[item.id] || rendering.has(item.id)) return;
  if (thumbnailKind(file) === 'none') return;

  rendering.add(item.id);
  const dataUrl = await renderThumbnailDataUrl(file);
  rendering.delete(item.id);

  // The entry can be removed while its thumbnail renders; a late result must
  // not resurrect the row or land on a different file's id.
  if (dataUrl && fileList.value.some((entry) => entry.id === item.id)) {
    thumbnails.value = { ...thumbnails.value, [item.id]: dataUrl };
  }
}

function syncThumbnails() {
  const live = new Set(fileList.value.map((item) => item.id));
  const kept: Record<string, string> = {};
  for (const [id, dataUrl] of Object.entries(thumbnails.value)) {
    if (live.has(id)) kept[id] = dataUrl;
  }
  thumbnails.value = kept;

  for (const item of fileList.value) void ensureThumbnail(item);
}

watch(fileList, syncThumbnails, { immediate: true });

function emitFiles() {
  emit('change', files.value);
}

// naive-ui appends every pick to the list, so single-file tools keep only the newest entry.
function onUpdate(list: UploadFileInfo[]) {
  fileList.value = props.multiple ? list : list.slice(-1);
  emitFiles();
}

function remove(index: number) {
  const item = fileList.value[index];
  if (item) delete thumbnails.value[item.id];
  fileList.value = fileList.value.filter((_, i) => i !== index);
  emitFiles();
}

let pasteSequence = 0;

function toFileInfo(file: File): UploadFileInfo {
  return {
    id: `pasted-${Date.now()}-${pasteSequence++}`,
    name: file.name,
    status: 'pending',
    file,
    type: file.type,
  };
}

// The paste event is the only channel that carries a copied file (or a copied
// screenshot) without a clipboard permission prompt. It has to live on the
// document: a paste with no focused editor is dispatched there, not at the
// control. Clipboards without files are left alone so the tools' own text
// inputs keep receiving ordinary text pastes.
function onPaste(event: ClipboardEvent) {
  const pasted = collectClipboardFiles(event.clipboardData);
  if (!pasted.length) return;

  const { accepted } = splitByAccept(pasted, props.accept);
  if (!accepted.length) {
    message.warning(t('tool.fileUpload.rejected'));
    return;
  }

  event.preventDefault();
  const entries = (props.multiple ? accepted : accepted.slice(0, 1)).map(toFileInfo);
  fileList.value = props.multiple ? [...fileList.value, ...entries] : entries;
  emitFiles();
}

async function triggerPaste() {
  try {
    const items = await navigator.clipboard.read();
    const pasted: File[] = [];
    for (const item of items) {
      for (const type of item.types) {
        const blob = await item.getType(type);
        const ext = type.split('/').pop() ?? 'bin';
        pasted.push(new File([blob], `pasted.${ext}`, { type }));
      }
    }
    if (!pasted.length) {
      message.warning(t('tool.fileUpload.rejected'));
      return;
    }
    const { accepted } = splitByAccept(pasted, props.accept);
    if (!accepted.length) {
      message.warning(t('tool.fileUpload.rejected'));
      return;
    }
    const entries = (props.multiple ? accepted : accepted.slice(0, 1)).map(toFileInfo);
    fileList.value = props.multiple ? [...fileList.value, ...entries] : entries;
    emitFiles();
  } catch {
    message.warning(t('tool.fileUpload.rejected'));
  }
}

const uploadRef = ref<InstanceType<typeof NUpload> | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

function triggerSelect() {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  } else if (uploadRef.value) {
    const input = uploadRef.value.$el?.querySelector('input[type="file"]');
    if (input) input.click();
  }
}

function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const selectedFiles = input.files ? Array.from(input.files) : [];
  if (!selectedFiles.length) return;

  const { accepted } = splitByAccept(selectedFiles, props.accept);
  if (!accepted.length) {
    message.warning(t('tool.fileUpload.rejected'));
    input.value = '';
    return;
  }

  const entries = (props.multiple ? accepted : accepted.slice(0, 1)).map(toFileInfo);
  fileList.value = props.multiple ? [...fileList.value, ...entries] : entries;
  emitFiles();
  input.value = '';
}

defineExpose({ triggerPaste, triggerSelect });

onMounted(() => document.addEventListener('paste', onPaste));
onUnmounted(() => document.removeEventListener('paste', onPaste));
</script>

<template>
  <div class="tool-file-upload">
    <NUpload
      v-if="!compact"
      ref="uploadRef"
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

    <!-- Hidden file input for compact mode -->
    <input
      v-if="compact"
      ref="fileInputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      style="display: none"
      @change="onFileInputChange"
    />

    <ul v-if="fileList.length || compact" class="tool-file-upload__files">
      <li v-for="(item, index) in fileList" :key="item.id" class="tool-file-upload__item">
        <FileCard
          :name="item.name"
          :file="item.file ?? undefined"
          :file-type="item.type ?? undefined"
          :thumbnail-url="thumbnails[item.id]"
          :removable="removable"
          @remove="remove(index)"
        />
      </li>
      <li v-if="compact && (multiple || fileList.length === 0)" class="tool-file-upload__item tool-file-upload__compact-slot" @click="triggerSelect()">
        <div class="tool-file-upload__compact-trigger">
          <NIcon :size="20" :component="CloudUpload" class="tool-file-upload__compact-icon" />
        </div>
        <span class="tool-file-upload__compact-name"></span>
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
  gap: var(--spacing-sm);
}

.tool-file-upload__item {
  list-style: none;
}

.tool-file-upload__compact-trigger {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 128px;
  height: 128px;
  border: 2px dashed var(--color-hairline-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface-soft);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.tool-file-upload__compact-trigger:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.tool-file-upload__compact-slot {
  cursor: pointer;
}

.tool-file-upload__compact-slot:hover .tool-file-upload__compact-trigger {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.tool-file-upload__compact-name {
  min-height: 1em;
}

.tool-file-upload__compact-icon {
  color: var(--color-text-3);
}
</style>
