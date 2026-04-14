export interface HtmlSanitizerConfig {
    allowedTags?: Set<string>;
    allowedAttrs?: Set<string>;
    allowedStyleProps?: Set<string>;
    allowDataImages?: boolean;
}

export const DEFAULT_ALLOWED_TAGS = new Set<string>([
    'a', 'abbr', 'address', 'b', 'blockquote', 'br', 'caption', 'cite', 'code', 'col', 'colgroup',
    'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'hr', 'i', 'img', 'ins', 'kbd', 'label', 'li', 'mark', 'ol', 'p', 'pre', 'q', 's', 'samp',
    'section', 'small', 'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot',
    'th', 'thead', 'tr', 'u', 'ul', 'var', 'wbr', 'input',
]);

export const DEFAULT_ALLOWED_ATTRS = new Set<string>([
    'href', 'src', 'alt', 'title', 'colspan', 'rowspan', 'class', 'style', 'align',
    'target', 'rel', 'width', 'height', 'id', 'name', 'type', 'checked', 'disabled',
    'start', 'reversed', 'value', 'lang', 'dir', 'role', 'tabindex',
    'data-task-list', 'data-task-item', 'data-font-size', 'data-font-family',
    'data-align', 'data-text-color', 'data-bg-color',
]);

export const DEFAULT_ALLOWED_STYLE_PROPS = new Set<string>([
    'color', 'background-color', 'background', 'text-align', 'font-size', 'font-family',
    'font-weight', 'font-style', 'text-decoration', 'text-decoration-line', 'text-decoration-color',
    'text-decoration-style', 'line-height', 'letter-spacing', 'padding', 'padding-left',
    'padding-right', 'padding-top', 'padding-bottom', 'margin', 'margin-left', 'margin-right',
    'margin-top', 'margin-bottom', 'border', 'border-color', 'border-width', 'border-style',
    'border-radius', 'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
    'vertical-align', 'white-space', 'display', 'list-style-type',
]);

const URL_ATTRS = new Set(['href', 'src']);
const MAX_DEPTH = 64;

function isSafeUrl(url: string, allowDataImages: boolean, attrName: string): boolean {
    const trimmed = url.trim().toLowerCase();
    if (trimmed === '') return true;
    if (trimmed.startsWith('javascript:')) return false;
    if (trimmed.startsWith('vbscript:')) return false;
    if (trimmed.startsWith('data:')) {
        if (!allowDataImages) return false;
        if (attrName !== 'src') return false;
        return trimmed.startsWith('data:image/');
    }
    return true;
}

function sanitizeStyle(styleValue: string, allowed: Set<string>): string {
    const decls = styleValue.split(';');
    const out: string[] = [];
    for (const decl of decls) {
        const idx = decl.indexOf(':');
        if (idx === -1) continue;
        const prop = decl.slice(0, idx).trim().toLowerCase();
        const val = decl.slice(idx + 1).trim();
        if (!prop || !val) continue;
        if (!allowed.has(prop)) continue;
        if (/expression\s*\(/i.test(val) || /url\s*\(/i.test(val) || /javascript:/i.test(val)) continue;
        out.push(prop + ': ' + val);
    }
    return out.join('; ');
}

function sanitizeElement(el: Element, config: Required<HtmlSanitizerConfig>, depth: number): Element | null {
    if (depth > MAX_DEPTH) return null;
    const tag = el.tagName.toLowerCase();
    if (!config.allowedTags.has(tag)) return null;

    const attrs = Array.from(el.attributes);
    for (const attr of attrs) {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on')) {
            el.removeAttribute(attr.name);
            continue;
        }
        if (!config.allowedAttrs.has(name)) {
            el.removeAttribute(attr.name);
            continue;
        }
        if (URL_ATTRS.has(name)) {
            if (!isSafeUrl(attr.value, config.allowDataImages, name)) {
                el.removeAttribute(attr.name);
                continue;
            }
        }
        if (name === 'style') {
            const cleaned = sanitizeStyle(attr.value, config.allowedStyleProps);
            if (cleaned) {
                el.setAttribute('style', cleaned);
            } else {
                el.removeAttribute('style');
            }
        }
        if (name === 'type' && tag === 'input') {
            if (attr.value.toLowerCase() !== 'checkbox') {
                return null;
            }
        }
    }

    if (tag === 'a') {
        const href = el.getAttribute('href');
        if (href && /^https?:|^mailto:|^tel:|^#|^\//.test(href.trim())) {
            const target = el.getAttribute('target');
            if (target === '_blank') {
                el.setAttribute('rel', 'noopener noreferrer');
            }
        }
    }

    return el;
}

function walk(node: Node, config: Required<HtmlSanitizerConfig>, depth: number): void {
    const children = Array.from(node.childNodes);
    for (const child of children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const el = child as Element;
            const kept = sanitizeElement(el, config, depth);
            if (!kept) {
                el.remove();
                continue;
            }
            walk(el, config, depth + 1);
        } else if (child.nodeType === Node.COMMENT_NODE) {
            (child as ChildNode).remove();
        }
    }
}

export function sanitizeHtml(html: string, userConfig?: HtmlSanitizerConfig): string {
    if (!html) return '';
    if (typeof DOMParser === 'undefined') return '';
    const config: Required<HtmlSanitizerConfig> = {
        allowedTags: userConfig?.allowedTags ?? DEFAULT_ALLOWED_TAGS,
        allowedAttrs: userConfig?.allowedAttrs ?? DEFAULT_ALLOWED_ATTRS,
        allowedStyleProps: userConfig?.allowedStyleProps ?? DEFAULT_ALLOWED_STYLE_PROPS,
        allowDataImages: userConfig?.allowDataImages ?? true,
    };

    const parser = new DOMParser();
    const wrapped = '<!DOCTYPE html><html><body>' + html + '</body></html>';
    const doc = parser.parseFromString(wrapped, 'text/html');

    const body = doc.body;
    if (!body) return '';

    const dangerousSelectors = ['script', 'iframe', 'object', 'embed', 'style', 'link', 'meta', 'base', 'form'];
    for (const sel of dangerousSelectors) {
        const found = body.querySelectorAll(sel);
        found.forEach((n) => n.remove());
    }

    walk(body, config, 0);

    return body.innerHTML;
}
