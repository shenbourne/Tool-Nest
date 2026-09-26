import { i18n } from '@/i18n';
export interface XmlFormatResult {
  formatted: string;
  error: string | null;
}

function indentNode(node: Node, indent: string, level: number): string {
  const pad = indent.repeat(level);
  const padInner = indent.repeat(level + 1);

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim() || '';
    return text;
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return `${pad}<!--${node.textContent}-->`;
  }

  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `${pad}<![CDATA[${node.textContent}]]>`;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as Element;
  const tagName = element.tagName;

  let attrs = '';
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    attrs += ` ${attr.name}="${escapeAttrValue(attr.value)}"`;
  }

  const children = Array.from(element.childNodes);
  const childElements = children.filter(c => c.nodeType === Node.ELEMENT_NODE || c.nodeType === Node.COMMENT_NODE);
  const textChildren = children.filter(c => c.nodeType === Node.TEXT_NODE && c.textContent?.trim());

  if (childElements.length === 0 && textChildren.length === 0) {
    // Self-closing or empty element
    return `${pad}<${tagName}${attrs}/>`;
  }

  if (childElements.length === 0 && textChildren.length === 1) {
    // Single text child — keep on one line
    return `${pad}<${tagName}${attrs}>${textChildren[0].textContent?.trim()}</${tagName}>`;
  }

  // Has child elements or multiple children
  const lines: string[] = [];
  lines.push(`${pad}<${tagName}${attrs}>`);

  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE || child.nodeType === Node.COMMENT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) {
      lines.push(indentNode(child, indent, level + 1));
    } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      lines.push(`${padInner}${child.textContent.trim()}`);
    }
  }

  lines.push(`${pad}</${tagName}>`);
  return lines.join('\n');
}

function escapeAttrValue(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function formatXml(input: string, indentSize: number = 2): XmlFormatResult {
  if (!input.trim()) {
    return { formatted: '', error: null };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'application/xml');

    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return { formatted: '', error: parseError.textContent || i18n.global.t('tools.xmlFormatter.errorInvalidXml') };
    }

    const indent = ' '.repeat(indentSize);
    const lines: string[] = [];

    // Add XML declaration if present
    for (let i = 0; i < doc.childNodes.length; i++) {
      const child = doc.childNodes[i];
      if (child.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
        lines.push(`<?${(child as ProcessingInstruction).target} ${(child as ProcessingInstruction).data}?>`);
      } else if (child.nodeType === Node.COMMENT_NODE) {
        lines.push(`<!--${child.textContent}-->`);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        lines.push(indentNode(child, indent, 0));
      }
    }

    return { formatted: lines.join('\n'), error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : i18n.global.t('tools.xmlFormatter.errorParseFailed');
    return { formatted: '', error: message };
  }
}

export function minifyXml(input: string): XmlFormatResult {
  if (!input.trim()) {
    return { formatted: '', error: null };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'application/xml');

    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return { formatted: '', error: parseError.textContent || i18n.global.t('tools.xmlFormatter.errorInvalidXml') };
    }

    const serializer = new XMLSerializer();
    let result = serializer.serializeToString(doc);
    // Remove unnecessary whitespace between tags
    result = result.replace(/>\s+</g, '><');
    return { formatted: result, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : i18n.global.t('tools.xmlFormatter.errorParseFailed');
    return { formatted: '', error: message };
  }
}
