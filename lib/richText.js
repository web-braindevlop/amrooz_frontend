/**
 * Rich-text helpers for the admin description editor.
 *
 * The editor stores plain HTML. Because that HTML is later rendered with
 * `dangerouslySetInnerHTML` on the storefront, everything that leaves the
 * editor (and everything pasted into it) is run through `sanitizeHtml`,
 * which is a strict allow-list — unknown tags are unwrapped, unknown
 * attributes are dropped.
 *
 * WordPress' `<!--more-->` tag is kept as a real comment node in the stored
 * markup and swapped for a visible, non-editable marker while editing.
 */

/** tag -> allowed attributes */
const ALLOWED_TAGS = {
  p: [],
  br: [],
  b: [],
  strong: [],
  i: [],
  em: [],
  u: [],
  s: [],
  strike: [],
  del: [],
  sub: [],
  sup: [],
  code: [],
  pre: [],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  h5: [],
  h6: [],
  blockquote: [],
  ul: [],
  ol: [],
  li: [],
  hr: [],
  a: ['href', 'title', 'target', 'rel'],
  span: [],
  div: [],
  font: ['color', 'size'],
};

/** Tags whose `style` attribute may survive, filtered to the props below. */
const STYLE_ALLOWED_TAGS = new Set([
  'p', 'span', 'div', 'li', 'ul', 'ol', 'blockquote',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
]);

const ALLOWED_STYLE_PROPS = new Set([
  'color',
  'background-color',
  'text-align',
  'margin-left',
  'padding-left',
  'font-weight',
  'font-style',
  'text-decoration',
]);

/** Tags that are dropped entirely, contents and all. */
const DROP_WITH_CONTENT = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'link', 'meta',
  'form', 'input', 'button', 'select', 'textarea', 'noscript',
]);

const SAFE_URL = /^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/)/i;

/** Class + data flag used for the visible "Read More" marker while editing. */
export const MORE_CLASS = 'rte-more';
export const MORE_ATTR = 'data-rte-more';

export function isSafeUrl(value) {
  const url = String(value || '').trim();
  if (!url) return false;
  // Strip the control characters browsers ignore inside "java\nscript:".
  const flat = url.replace(/[\u0000-\u0020]/g, '');
  if (/^(javascript|data|vbscript):/i.test(flat)) return false;
  return SAFE_URL.test(flat);
}

function sanitizeStyle(styleValue) {
  const kept = [];
  for (const decl of String(styleValue || '').split(';')) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const val = decl.slice(idx + 1).trim();
    if (!ALLOWED_STYLE_PROPS.has(prop)) continue;
    // url(...) and expression(...) never belong in these props.
    if (/url\(|expression\(|javascript:/i.test(val)) continue;
    kept.push(prop + ': ' + val);
  }
  return kept.join('; ');
}

/** Replace `node` with its own children, preserving order. */
function unwrap(node) {
  const parent = node.parentNode;
  if (!parent) return;
  while (node.firstChild) parent.insertBefore(node.firstChild, node);
  parent.removeChild(node);
}

function cleanElement(el) {
  const tag = el.tagName.toLowerCase();

  if (DROP_WITH_CONTENT.has(tag)) {
    el.remove();
    return;
  }

  // Recurse first so unwrapping a parent cannot skip its children.
  for (const child of Array.from(el.childNodes)) cleanNode(child);

  if (!Object.prototype.hasOwnProperty.call(ALLOWED_TAGS, tag)) {
    unwrap(el);
    return;
  }

  const isMore = tag === 'div' && el.getAttribute(MORE_ATTR) === '1';
  const allowed = ALLOWED_TAGS[tag];

  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase();

    if (isMore && (name === 'class' || name === MORE_ATTR || name === 'contenteditable')) {
      continue;
    }
    if (name === 'style' && STYLE_ALLOWED_TAGS.has(tag)) {
      const safe = sanitizeStyle(attr.value);
      if (safe) el.setAttribute('style', safe);
      else el.removeAttribute('style');
      continue;
    }
    if (!allowed.includes(name)) {
      el.removeAttribute(attr.name);
      continue;
    }
    if (name === 'href' && !isSafeUrl(attr.value)) {
      el.removeAttribute(attr.name);
    }
  }

  // Any link opening a new tab gets the security rel WordPress adds too.
  if (tag === 'a' && el.getAttribute('target') === '_blank') {
    el.setAttribute('rel', 'noopener noreferrer');
  }
}

function cleanNode(node) {
  if (node.nodeType === 1) {
    cleanElement(node);
  } else if (node.nodeType === 8) {
    // Comments are stripped except WordPress' more tag.
    if (String(node.nodeValue).trim() !== 'more') node.remove();
  } else if (node.nodeType !== 3) {
    node.remove();
  }
}

/**
 * Strip everything outside the allow-list from an HTML string.
 * Safe to call on untrusted input (e.g. clipboard payloads).
 */
export function sanitizeHtml(html) {
  if (typeof window === 'undefined' || !html) return html || '';
  const doc = document.implementation.createHTMLDocument('sanitize');
  doc.body.innerHTML = String(html);
  for (const child of Array.from(doc.body.childNodes)) cleanNode(child);
  return doc.body.innerHTML;
}

/** Build the non-editable block shown in place of `<!--more-->`. */
function createMoreMarker(doc) {
  const div = doc.createElement('div');
  div.className = MORE_CLASS;
  div.setAttribute(MORE_ATTR, '1');
  div.setAttribute('contenteditable', 'false');
  return div;
}

/** Stored HTML -> editor HTML (`<!--more-->` becomes a visible marker). */
export function toEditorHtml(stored) {
  if (typeof window === 'undefined' || !stored) return stored || '';
  const doc = document.implementation.createHTMLDocument('more-in');
  doc.body.innerHTML = String(stored);

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_COMMENT);
  const comments = [];
  while (walker.nextNode()) comments.push(walker.currentNode);

  for (const comment of comments) {
    if (String(comment.nodeValue).trim() !== 'more') continue;
    if (comment.parentNode) comment.parentNode.replaceChild(createMoreMarker(doc), comment);
  }
  return doc.body.innerHTML;
}

/** Editor HTML -> stored HTML (marker becomes `<!--more-->`, then sanitize). */
export function toStoredHtml(editorHtml) {
  if (typeof window === 'undefined' || !editorHtml) return editorHtml || '';
  const doc = document.implementation.createHTMLDocument('more-out');
  doc.body.innerHTML = String(editorHtml);

  const markers = Array.from(doc.body.querySelectorAll('[' + MORE_ATTR + '="1"]'));
  for (const marker of markers) {
    if (marker.parentNode) marker.parentNode.replaceChild(doc.createComment('more'), marker);
  }
  return sanitizeHtml(doc.body.innerHTML);
}

/**
 * Flatten HTML to readable text — used for card previews, the word count
 * and the "is this actually empty?" check. Works without a DOM so it is
 * safe to call while server-rendering.
 */
export function htmlToPlainText(html) {
  if (!html) return '';
  return String(html)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|blockquote|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/** True when the markup carries no text and no meaningful embed. */
export function isHtmlEmpty(html) {
  if (!html) return true;
  if (/<(img|hr|iframe)\b/i.test(html)) return false;
  return htmlToPlainText(html).length === 0;
}

/** Word count for the editor status bar, matching WordPress' rough rule. */
export function countWords(html) {
  const text = htmlToPlainText(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}
