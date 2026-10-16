import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMessage } from 'naive-ui';
import { fileCategory } from '@/utils/file-thumbnail';

export function useFilePreview() {
  const { t } = useI18n();
  const message = useMessage();

  const previewItem = ref<{ name: string; file?: File | null; type?: string | null } | null>(null);
  const previewText = ref<string | null>(null);
  const previewPdfPages = ref<string[]>([]);
  const previewVideoUrl = ref<string | null>(null);
  const previewImageUrl = ref<string | null>(null);

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

  function onPreviewBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) closePreview();
  }

  async function openPreview(item: { name: string; file?: File | null; type?: string | null }) {
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
        if (previewItem.value?.name === item.name) {
          previewText.value = String(reader.result ?? '');
        }
      };
      reader.readAsText(file);
    } else if (cat === 'pdf') {
      void renderPdfPreview(file).then((pages) => {
        if (previewItem.value?.name === item.name) previewPdfPages.value = pages;
      });
    } else if (cat === 'video') {
      previewVideoUrl.value = URL.createObjectURL(file);
    } else if (cat === 'image') {
      previewImageUrl.value = URL.createObjectURL(file);
    }
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

  return {
    t,
    message,
    previewItem,
    previewText,
    previewPdfPages,
    previewVideoUrl,
    previewImageUrl,
    openPreview,
    closePreview,
    onPreviewKeydown,
    onPreviewBackdropClick,
  };
}
