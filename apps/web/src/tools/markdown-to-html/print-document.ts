import markdownit from 'markdown-it';

// Raw HTML conversion/export is separate. Printable markup never admits raw HTML.
const printable = markdownit({ html: false, linkify: true });
export function buildPrintDocument(markdown: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; frame-src 'none'; object-src 'none'; connect-src 'none'; form-action 'none'; base-uri 'none'; img-src data: blob: https: http:; style-src 'unsafe-inline'"><title>Print</title><style>body{font:16px/1.6 sans-serif;overflow-wrap:anywhere}img{max-width:100%}pre{white-space:pre-wrap}</style></head><body>${printable.render(markdown)}</body></html>`;
}

export function printMarkdown(markdown: string): void {
  const frame = document.createElement('iframe');
  // Scripts/forms/popups/navigation are disabled. Same-origin permits only the
  // parent to invoke the browser's print API; no attacker HTML is interpreted.
  frame.setAttribute('sandbox', 'allow-same-origin allow-modals');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:100vw;height:100vh;border:0';
  frame.onload = () => {
    const target = frame.contentWindow;
    if (!target) { frame.remove(); return; }
    target.addEventListener('afterprint', () => frame.remove(), { once: true });
    target.focus();
    target.print();
  };
  frame.srcdoc = buildPrintDocument(markdown);
  document.body.append(frame);
}
