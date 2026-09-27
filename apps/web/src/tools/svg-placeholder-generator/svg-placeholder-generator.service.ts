function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function generateSvgPlaceholder(
  width: number,
  height: number,
  bgColor: string,
  fgColor: string,
  text?: string,
  fontSize?: number,
): string {
  const displayText = text || `${width}x${height}`;
  const computedFontSize = fontSize || Math.max(14, Math.min(width, height) / 5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <text x="50%" y="50%" fill="${fgColor}" font-size="${computedFontSize}" dominant-baseline="middle" text-anchor="middle">${escapeXml(displayText)}</text>
</svg>`;
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export function downloadSvg(svg: string, filename: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
