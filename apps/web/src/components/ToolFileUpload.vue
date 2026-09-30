<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { NUpload, NUploadDragger, NIcon, useMessage } from 'naive-ui';
import type { UploadFileInfo } from 'naive-ui';
import {
  CloudUpload,
  File as FileIcon,
  FileMusic,
  FileText,
  FileZip,
  FileCode,
  Photo,
  Table,
  Video,
  X,
} from '@vicons/tabler';
import type { Component } from 'vue';
import { useI18n } from 'vue-i18n';
import { collectClipboardFiles, splitByAccept } from '@/utils/clipboard-files';
import { fileCategory, thumbnailKind, type FileCategory } from '@/utils/file-thumbnail';
import { renderThumbnailDataUrl } from '@/utils/thumbnail-render';

const props = withDefaults(defineProps<{
  accept?: string;
  multiple?: boolean;
}>(), {
  accept: '',
  multiple: false,
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

const ICON_MAP: Record<FileCategory, Component> = {
  pdf: FileText,
  video: Video,
  audio: FileMusic,
  image: Photo,
  archive: FileZip,
  code: FileCode,
  spreadsheet: Table,
  text: FileText,
  other: FileIcon,
};

function fallbackIcon(file: File | null | undefined) {
  return ICON_MAP[fileCategory(file ?? { name: '', type: '' })];
}

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

onMounted(() => document.addEventListener('paste', onPaste));
onUnmounted(() => document.removeEventListener('paste', onPaste));

// --- QuickLook-style preview ---

const previewItem = ref<UploadFileInfo | null>(null);
const previewText = ref<string | null>(null);
const previewPdfPages = ref<string[]>([]);
const previewVideoUrl = ref<string | null>(null);
const previewImageUrl = ref<string | null>(null);

function openPreview(item: UploadFileInfo) {
  previewItem.value = item;
  previewText.value = null;
  previewPdfPages.value = [];
  previewVideoUrl.value = null;
  previewImageUrl.value = null;

  const file = item.file;
  if (!file) return;

  const cat = fileCategory(file);
  if (cat === 'text' || cat === 'code') {
    const reader = new FileReader();
    reader.onload = () => {
      if (previewItem.value?.id === item.id) {
        previewText.value = String(reader.result ?? '');
      }
    };
    reader.readAsText(file);
  } else if (cat === 'pdf') {
    void renderPdfPreview(file).then((pages) => {
      if (previewItem.value?.id === item.id) previewPdfPages.value = pages;
    });
  } else if (cat === 'video') {
    previewVideoUrl.value = URL.createObjectURL(file);
  } else if (cat === 'image') {
    previewImageUrl.value = URL.createObjectURL(file);
  }
}

function closePreview() {
  if (previewVideoUrl.value) URL.revokeObjectURL(previewVideoUrl.value);
  if (previewImageUrl.value) URL.revokeObjectURL(previewImageUrl.value);
  previewItem.value = null;
  previewText.value = null;
  previewPdfPages.value = [];
  previewVideoUrl.value = null;
  previewImageUrl.value = null;
}

function onPreviewKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closePreview();
}

async function renderPdfPreview(file: File): Promise<string[]> {
  try {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url,
    ).toString();

    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    try {
      const pageWidth = 800;
      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = pageWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) return pages;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        pages.push(canvas.toDataURL('image/png'));
      }

      return pages;
    } finally {
      await pdf.destroy();
    }
  } catch {
    return [];
  }
}

function onPreviewBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) closePreview();
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
      <li
        v-for="(item, index) in fileList"
        :key="item.id"
        class="tool-file-upload__file"
        @click="openPreview(item)"
      >
        <button
          type="button"
          class="tool-file-upload__remove"
          :title="t('common.remove')"
          @click.stop="remove(index)"
        >
          <NIcon :size="14" :component="X" />
        </button>
        <span class="tool-file-upload__thumb">
          <img
            v-if="thumbnails[item.id]"
            class="tool-file-upload__thumb-image"
            :src="thumbnails[item.id]"
            alt=""
          />
          <NIcon v-else :size="48" :component="fallbackIcon(item.file)" class="tool-file-upload__thumb-icon" />
        </span>
        <span class="tool-file-upload__name" :title="item.name">{{ item.name }}</span>
      </li>
    </ul>

    <Teleport to="body">
      <div
        v-if="previewItem"
        class="file-preview-overlay"
        @click="onPreviewBackdropClick"
        @keydown="onPreviewKeydown"
      >
        <div class="file-preview__content" @click.stop>
          <button type="button" class="file-preview__close" @click="closePreview">
            <NIcon :size="20" :component="X" />
          </button>

          <!-- Image -->
          <img
            v-if="previewImageUrl"
            class="file-preview__image"
            :src="previewImageUrl"
            :alt="previewItem.name"
          />

          <!-- PDF rendered preview -->
          <div
            v-else-if="previewPdfPages.length > 0"
            class="file-preview__pdf"
          >
            <img
              v-for="(page, idx) in previewPdfPages"
              :key="idx"
              class="file-preview__pdf-page"
              :src="page"
              :alt="`${previewItem.name} — page ${idx + 1}`"
            />
          </div>

          <!-- Video -->
          <video
            v-else-if="previewVideoUrl"
            class="file-preview__video"
            :src="previewVideoUrl"
            controls
          />

          <!-- Text / code -->
          <pre v-else-if="previewText !== null" class="file-preview__text">{{ previewText }}</pre>

          <!-- Fallback: large type icon -->
          <div v-else class="file-preview__fallback">
            <NIcon :size="96" :component="fallbackIcon(previewItem.file)" />
            <span class="file-preview__fallback-name">{{ previewItem.name }}</span>
          </div>

          <p class="file-preview__filename">{{ previewItem.name }}</p>
        </div>
      </div>
    </Teleport>
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-sm);
}

.tool-file-upload__file {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: var(--spacing-xs);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  background: var(--color-surface-soft);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.tool-file-upload__file:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tool-file-upload__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: var(--color-surface-2);
  color: var(--color-text-3);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, color 0.15s ease;
  z-index: 1;
}

.tool-file-upload__file:hover .tool-file-upload__remove {
  opacity: 1;
}

.tool-file-upload__remove:hover {
  color: var(--color-error);
  background: var(--color-surface-3);
}

.tool-file-upload__thumb {
  box-sizing: border-box;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 128px;
  height: 128px;
  overflow: hidden;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
}

.tool-file-upload__thumb-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tool-file-upload__thumb-icon {
  color: var(--color-text-3);
}

.tool-file-upload__name {
  margin-top: var(--spacing-xxs);
  width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--font-size-caption);
  color: var(--color-ink);
}
</style>

<style>
/* Non-scoped: the preview overlay is teleported to body, so scoped styles
   cannot reach it. */
.file-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  animation: file-preview-fade-in 0.15s ease;
}

@keyframes file-preview-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.file-preview__content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.file-preview__close {
  position: absolute;
  top: -40px;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease;
}

.file-preview__close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.file-preview__image {
  max-width: 85vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.file-preview__pdf {
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.file-preview__pdf-page {
  max-width: 85vw;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.file-preview__video {
  max-width: 85vw;
  max-height: 80vh;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.file-preview__text {
  max-width: 80vw;
  max-height: 75vh;
  overflow: auto;
  padding: 24px;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 8px;
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.file-preview__fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
}

.file-preview__fallback-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.file-preview__filename {
  margin-top: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  max-width: 60vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
