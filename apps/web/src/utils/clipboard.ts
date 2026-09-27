/**
 * Clipboard writes with explicit success/failure reporting.
 *
 * `navigator.clipboard` only exists in a secure context, but ToolNest is meant
 * to run on a local machine or a trusted LAN over plain HTTP, so the legacy
 * `document.execCommand('copy')` path is still the working one there. Callers
 * need a boolean result so they can tell the user when a copy failed instead of
 * leaving the click silently ignored.
 */

function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined' || !document.body) return false;

  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '-1000px';
  area.style.opacity = '0';
  document.body.appendChild(area);

  try {
    area.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(area);
  }
}

export async function writeClipboardText(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // The async API rejects in insecure contexts, when the document is not
    // focused, or when permission is denied — all recoverable via the legacy
    // path below.
  }

  return legacyCopy(text);
}

export async function writeClipboardImage(blob: Blob): Promise<boolean> {
  try {
    if (
      typeof ClipboardItem === 'undefined' ||
      typeof navigator === 'undefined' ||
      !navigator.clipboard?.write
    ) {
      return false;
    }
    await navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
    return true;
  } catch {
    // No legacy fallback exists for binary clipboard payloads.
    return false;
  }
}
