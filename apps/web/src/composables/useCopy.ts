import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { writeClipboardFile, writeClipboardImage, writeClipboardText } from '@/utils/clipboard';

/**
 * Clipboard feedback shared by every tool. Tools previously called
 * `navigator.clipboard` directly, so a rejected or unsupported copy looked
 * identical to a successful one; this reports both outcomes.
 */
export function useCopy() {
  const message = useMessage();
  const { t } = useI18n();

  async function copyToClipboard(text: string, successMessage?: string): Promise<boolean> {
    const ok = await writeClipboardText(text);
    if (ok) message.success(successMessage ?? t('tool.copied'));
    else message.error(t('tool.copyFailed'));
    return ok;
  }

  async function copyImageToClipboard(blob: Blob, successMessage?: string): Promise<boolean> {
    const ok = await writeClipboardImage(blob);
    if (ok) message.success(successMessage ?? t('tool.copied'));
    else message.error(t('tool.copyImageFailed'));
    return ok;
  }

  async function copyFileToClipboard(blob: Blob, successMessage?: string): Promise<boolean> {
    const ok = await writeClipboardFile(blob);
    if (ok) message.success(successMessage ?? t('tool.copied'));
    else message.error(t('tool.copyFileFailed'));
    return ok;
  }

  return { copyToClipboard, copyImageToClipboard, copyFileToClipboard };
}
