<script setup lang="ts">
import { NIcon } from 'naive-ui';
import {
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
import { fileCategory, type FileCategory } from '@/utils/file-thumbnail';
import { useFilePreview } from '@/composables/useFilePreview';
import FilePreviewOverlay from '@/components/FilePreviewOverlay.vue';

const props = defineProps<{
  name: string;
  file?: File | null;
  fileType?: string;
  thumbnailUrl?: string;
  removable?: boolean;
}>();

const emit = defineEmits<{
  remove: [];
}>();

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

function fallbackIcon() {
  return ICON_MAP[fileCategory({ name: props.name, type: props.fileType ?? '' })];
}

const {
  previewItem,
  previewText,
  previewPdfPages,
  previewVideoUrl,
  previewImageUrl,
  openPreview,
  closePreview,
  onPreviewKeydown,
  onPreviewBackdropClick,
} = useFilePreview();

function handleClick() {
  if (props.file) {
    void openPreview({ name: props.name, file: props.file, type: props.fileType ?? '' });
  }
}
</script>

<template>
  <div class="file-card" @click="handleClick">
    <button
      v-if="removable"
      type="button"
      class="file-card__remove"
      @click.stop="emit('remove')"
    >
      <NIcon :size="14" :component="X" />
    </button>
    <span class="file-card__thumb">
      <img
        v-if="thumbnailUrl"
        class="file-card__thumb-image"
        :src="thumbnailUrl"
        alt=""
      />
      <NIcon v-else :size="48" :component="fallbackIcon()" class="file-card__thumb-icon" />
    </span>
    <span class="file-card__name" :title="name">{{ name }}</span>
  </div>

  <FilePreviewOverlay
    :preview-item="previewItem"
    :preview-text="previewText"
    :preview-pdf-pages="previewPdfPages"
    :preview-video-url="previewVideoUrl"
    :preview-image-url="previewImageUrl"
    @close="closePreview"
    @backdrop-click="onPreviewBackdropClick"
    @keydown="onPreviewKeydown"
  />
</template>

<style scoped>
/* The card takes whatever width its container hands it: a 128px grid cell
   renders a 128x128 tile, a full-width cell renders the wide card. */
.file-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xxs);
  position: relative;
  width: 100%;
  min-width: 0;
  cursor: pointer;
}

.file-card__remove {
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

.file-card:hover .file-card__remove {
  opacity: 1;
}

.file-card__remove:hover {
  color: var(--color-error);
  background: var(--color-surface-3);
}

.file-card__thumb {
  box-sizing: border-box;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 128px;
  overflow: hidden;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.file-card:hover .file-card__thumb {
  border-color: var(--color-hairline-strong);
  box-shadow: var(--shadow-card);
}

/* Thumbnails are square data URLs, so `contain` keeps a wide card's preview
   whole instead of cropping it. */
.file-card__thumb-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.file-card__thumb-icon {
  color: var(--color-primary);
}

.file-card__name {
  width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--font-size-caption);
  color: var(--color-ink);
}
</style>
