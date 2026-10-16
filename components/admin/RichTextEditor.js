'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/format';
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  BulletListIcon,
  ClearFormattingIcon,
  CloseIcon,
  CodeTabIcon,
  FontDecreaseIcon,
  FontIncreaseIcon,
  HorizontalRuleIcon,
  IndentIcon,
  ItalicIcon,
  KitchenSinkIcon,
  LinkIcon,
  NumberListIcon,
  OutdentIcon,
  PasteTextIcon,
  QuoteIcon,
  ReadMoreIcon,
  RedoIcon,
  SpecialCharIcon,
  StrikethroughIcon,
  TextColorIcon,
  UndoIcon,
  UnlinkIcon,
  VisualTabIcon,
} from '@/components/ui/Icons';
import {
  MORE_ATTR,
  MORE_CLASS,
  countWords,
  isSafeUrl,
  sanitizeHtml,
  toEditorHtml,
  toStoredHtml,
} from '@/lib/richText';

/**
 * Classic-WordPress-style rich text editor.
 *
 * Built on `contentEditable` + `document.execCommand`. execCommand is a
 * deprecated API, but it is still implemented by every current browser and
 * is the only way to get this toolbar without pulling in an editor
 * framework — this project ships zero runtime dependencies beyond React.
 *
 * The value handed to `onChange` is sanitized HTML (see `lib/richText.js`).
 */

const BLOCK_FORMATS = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'h5', label: 'Heading 5' },
  { value: 'h6', label: 'Heading 6' },
];

/**
 * Text colours. The plate is split the way WordPress' colour picker is:
 * the palette you should normally reach for first, then a full spectrum,
 * then a free-form picker for anything else.
 */
const THEME_COLORS = [
  { value: '#17150f', label: 'Ink' },
  { value: '#262019', label: 'Soft black' },
  { value: '#4a453c', label: 'Charcoal' },
  { value: '#7a7365', label: 'Stone' },
  { value: '#a9a294', label: 'Ash' },
  { value: '#d5c7ae', label: 'Sand' },
  { value: '#f2ede3', label: 'Sand light' },
  { value: '#ffffff', label: 'White' },
];

const BRAND_COLORS = [
  { value: '#c8a24a', label: 'Gold' },
  { value: '#b9974a', label: 'Muted gold' },
  { value: '#9c7c30', label: 'Dark gold' },
  { value: '#e7d5a6', label: 'Soft gold' },
  { value: '#8c2f39', label: 'Bordeaux' },
  { value: '#5b4a35', label: 'Bark' },
  { value: '#2b3a4a', label: 'Navy' },
  { value: '#6b7d5b', label: 'Sage' },
];

/** 8 hues x 5 shades, rendered lightest row first. */
const SPECTRUM = [
  { label: 'Red', shades: ['#fdeaea', '#f3b0b0', '#e26a6a', '#c0392b', '#7f2418'] },
  { label: 'Orange', shades: ['#fdf0e3', '#f6cf9e', '#ec9f4f', '#d97a1e', '#8f4c0d'] },
  { label: 'Amber', shades: ['#fdf7e3', '#f3e3a6', '#e3c95c', '#b08a2e', '#8a6c1f'] },
  { label: 'Green', shades: ['#ecf5ec', '#bcdcbc', '#7ab97a', '#3f8f4f', '#1f5a2e'] },
  { label: 'Teal', shades: ['#e6f4f3', '#b0dedb', '#66bdb7', '#2f8f89', '#17544f'] },
  { label: 'Blue', shades: ['#eaf1f8', '#b6cfe8', '#6fa3d2', '#2b6cb0', '#1a3f6b'] },
  { label: 'Violet', shades: ['#f0ecf8', '#cbbde8', '#9c85d2', '#6b4fb0', '#3f2d6b'] },
  { label: 'Pink', shades: ['#fceef3', '#f4bfd3', '#e688ab', '#c85480', '#7f2f4d'] },
];

const SHADE_LEVELS = [0, 1, 2, 3, 4];

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Accept "c8a24a", "#c8a24a" or "#ca4" and return a full "#rrggbb". */
function normalizeHex(raw) {
  const value = String(raw || '').trim();
  if (!HEX_RE.test(value)) return null;
  let hex = value.replace('#', '').toLowerCase();
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  return '#' + hex;
}

/**
 * Special characters, grouped the way the classic editor's dialog groups
 * them so the card stays scannable instead of being one long wall of glyphs.
 */
const SPECIAL_CHAR_GROUPS = [
  {
    label: 'Punctuation & quotes',
    chars: ['–', '—', '…', '·', '•', '“', '”', '‘', '’', '„', '‚', '«', '»', '‹', '›', '¡', '¿', '§', '¶', '†', '‡', '′', '″', '‑'],
  },
  {
    label: 'Currency',
    chars: ['$', '€', '£', '¥', '¢', '₹', '₩', '₪', '₫', '₽', '₺', '¤'],
  },
  {
    label: 'Mathematics',
    chars: ['±', '×', '÷', '−', '≈', '≠', '≤', '≥', '∞', '√', '∑', '∏', '∫', '∂', '½', '¼', '¾', '⅓', '⅔', '°', 'µ', '‰', '%', '№'],
  },
  {
    label: 'Symbols & marks',
    chars: ['©', '®', '™', '★', '☆', '♥', '✓', '✗', '☞', '♪', '✉', '☎', '⚑', '■', '●', '▲', '&', '<', '>', '#', '@', '*', '|', '~'],
  },
  {
    label: 'Arrows',
    chars: ['←', '↑', '→', '↓', '↔', '↕', '⇐', '⇒', '⇔', '↵', '↗', '↘'],
  },
  {
    label: 'Latin & accented',
    chars: ['à', 'á', 'â', 'ä', 'ã', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ñ', 'ò', 'ó', 'ô', 'ö', 'õ', 'ø', 'œ', 'ù', 'ú', 'û', 'ü', 'ý', 'ÿ', 'ß', 'À', 'Á', 'Ä', 'Ç', 'É', 'Ê', 'Ñ', 'Ö', 'Ü'],
  },
  {
    label: 'Greek',
    chars: ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'σ', 'φ', 'ω', 'Δ', 'Σ', 'Ω', 'Φ'],
  },
];

/** "U+2014" style label for a character. */
function codePointLabel(char) {
  return 'U+' + char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
}

/** "&#8212; - U+2014" style label shown in the preview panel. */
function entityLabel(char) {
  return '&#' + char.codePointAt(0) + '; \u2014 ' + codePointLabel(char);
}

/** Popovers that render as a centred card rather than a dropdown. */
const MODAL_POPOVERS = ['color', 'chars'];

const EMPTY_DOC = '<p><br></p>';

/**
 * Accept what the user typed, or null if it can never be a safe link.
 * A bare domain gets https:// prepended, the way WordPress does.
 */
function normalizeLinkUrl(raw) {
  const url = String(raw || '').trim();
  if (!url) return null;
  if (/^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/)/i.test(url)) return isSafeUrl(url) ? url : null;
  // Any other explicit scheme (javascript:, data:, vbscript:, ...) is refused.
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return null;
  return isSafeUrl('https://' + url) ? 'https://' + url : null;
}

/** Blocks that should not survive as empty leftovers after a select-all delete. */
const STICKY_BLOCKS = 'blockquote, ul, ol, h1, h2, h3, h4, h5, h6';

function isBlank(el) {
  return !el.textContent.trim() && !el.querySelector('hr, img, [' + MORE_ATTR + ']');
}

function placeCaretAtStart(el) {
  const range = document.createRange();
  range.selectNodeContents(el.firstChild || el);
  range.collapse(true);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Deleting all the text inside a blockquote or list leaves the empty wrapper
 * behind, and everything typed next silently lands back inside it. Collapse
 * that case to a plain paragraph — empty paragraphs are left alone so that
 * pressing Enter for spacing still works.
 */
function normalizeEmptyBlocks(el) {
  if (!el.innerHTML.trim()) {
    el.innerHTML = EMPTY_DOC;
    placeCaretAtStart(el);
    return;
  }
  if (!isBlank(el) || !el.querySelector(STICKY_BLOCKS)) return;
  el.innerHTML = EMPTY_DOC;
  placeCaretAtStart(el);
}

/** Single toolbar button. */
function TB({ icon: Icon, label, active, onClick, className, disabled }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active ? 'true' : 'false'}
      disabled={disabled}
      // Keep the caret in the editor — without this the button steals focus
      // and execCommand has no selection to act on.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-primary/70',
        'transition-colors hover:border-black/10 hover:bg-white hover:text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        'disabled:pointer-events-none disabled:opacity-40',
        active && 'border-black/10 bg-white text-accent-dark shadow-card',
        className
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-0.5 h-6 w-px shrink-0 bg-black/10" />;
}

/**
 * Centred dialog card used by the colour and special-character pickers.
 * Portalled to <body> so it is never clipped by the admin layout's
 * overflow-hidden panes, and so its inputs sit outside the product <form>.
 */
function EditorModal({ title, description, onClose, children, width = 'max-w-xl' }) {
  // Only ever rendered in response to a click, so there is no server pass to
  // guard against — but stay defensive in case that changes.
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-[2px]"
        onMouseDown={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-rte-modal
        className={cn(
          'relative z-10 my-auto w-full overflow-hidden rounded-3xl border border-black/10 bg-white shadow-luxe',
          width
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-black/5 px-6 py-4">
          <div>
            <h3 className="font-serif text-lg leading-tight text-primary">{title}</h3>
            {description && <p className="mt-1 text-xs text-primary/45">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-primary/40 transition-colors hover:bg-black/5 hover:text-primary"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/** One colour cell in the plate. */
function Swatch({ value, label, selected, onPick, size = 'h-8 w-8' }) {
  return (
    <button
      type="button"
      title={label + ' — ' + value}
      aria-label={'Text color ' + label + ' ' + value}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onPick(value)}
      className={cn(
        'rounded-lg border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        size,
        selected ? 'border-primary ring-2 ring-primary/30' : 'border-black/15'
      )}
      style={{ backgroundColor: value }}
    />
  );
}

export default function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = 'Write the product description…',
  minHeight = 260,
}) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  // The last value we pushed upward — lets us tell "the parent echoed our
  // own change" (ignore) from "the parent set a new value" (reload).
  const lastEmittedRef = useRef(null);

  const [mode, setMode] = useState('visual');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pasteAsText, setPasteAsText] = useState(false);
  const [popover, setPopover] = useState(null); // 'link' | 'color' | 'chars'
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [hasLink, setHasLink] = useState(false);
  const [customColor, setCustomColor] = useState('#c8a24a');
  const [customHex, setCustomHex] = useState('#c8a24a');
  const [recentColors, setRecentColors] = useState([]);
  const [charPreview, setCharPreview] = useState(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [state, setState] = useState({
    bold: false,
    italic: false,
    strikeThrough: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    block: 'p',
    fontSize: '',
  });

  /* ------------------------------------------------------------------ */
  /*  Selection helpers                                                  */
  /* ------------------------------------------------------------------ */

  const selectionInEditor = useCallback(() => {
    const el = editorRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    return el.contains(range.commonAncestorContainer) ? range : null;
  }, []);

  const saveSelection = useCallback(() => {
    const range = selectionInEditor();
    if (range) savedRangeRef.current = range.cloneRange();
  }, [selectionInEditor]);

  const restoreSelection = useCallback(() => {
    const el = editorRef.current;
    const range = savedRangeRef.current;
    if (!el) return;
    el.focus();
    if (!range) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }, []);

  /** Nearest <a> ancestor of the caret, if any. */
  const anchorAtCaret = useCallback(() => {
    const el = editorRef.current;
    const range = selectionInEditor() || savedRangeRef.current;
    if (!el || !range) return null;
    let node = range.startContainer;
    if (node.nodeType === 3) node = node.parentNode;
    while (node && node !== el) {
      if (node.tagName === 'A') return node;
      node = node.parentNode;
    }
    return null;
  }, [selectionInEditor]);

  /* ------------------------------------------------------------------ */
  /*  Value in / out                                                     */
  /* ------------------------------------------------------------------ */

  const emit = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    normalizeEmptyBlocks(el);
    const stored = toStoredHtml(el.innerHTML);
    lastEmittedRef.current = stored;
    setIsEmpty(isBlank(el));
    onChange(stored);
  }, [onChange]);

  const refreshState = useCallback(() => {
    if (mode !== 'visual') return;
    const q = (cmd) => {
      try {
        return document.queryCommandState(cmd);
      } catch {
        return false;
      }
    };
    let block = 'p';
    try {
      const raw = String(document.queryCommandValue('formatBlock') || '').toLowerCase();
      if (raw) block = raw === 'div' ? 'p' : raw;
    } catch {
      block = 'p';
    }
    let fontSize = '';
    try {
      fontSize = String(document.queryCommandValue('fontSize') || '');
    } catch {
      fontSize = '';
    }
    setState({
      bold: q('bold'),
      italic: q('italic'),
      strikeThrough: q('strikeThrough'),
      insertUnorderedList: q('insertUnorderedList'),
      insertOrderedList: q('insertOrderedList'),
      justifyLeft: q('justifyLeft'),
      justifyCenter: q('justifyCenter'),
      justifyRight: q('justifyRight'),
      block,
      fontSize,
    });
    setHasLink(!!anchorAtCaret());
  }, [mode, anchorAtCaret]);

  // Load incoming value into the editor, but never while the user is typing
  // into it — that would reset the caret on every keystroke.
  useEffect(() => {
    const el = editorRef.current;
    if (!el || mode !== 'visual') return;
    if (value === lastEmittedRef.current) return;
    el.innerHTML = toEditorHtml(value || '') || EMPTY_DOC;
    lastEmittedRef.current = value;
    setIsEmpty(isBlank(el));
  }, [value, mode]);

  // Track formatting state as the caret moves.
  useEffect(() => {
    const onSelectionChange = () => {
      if (!selectionInEditor()) return;
      saveSelection();
      refreshState();
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [selectionInEditor, saveSelection, refreshState]);

  // Escape closes anything open; dropdowns also close on an outside click.
  // The modal cards handle their own dismissal through the backdrop instead.
  useEffect(() => {
    if (!popover) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setPopover(null);
    };
    document.addEventListener('keydown', onKey);

    if (MODAL_POPOVERS.includes(popover)) {
      return () => document.removeEventListener('keydown', onKey);
    }

    const onDown = (e) => {
      if (!e.target.closest?.('[data-rte-popover], [data-rte-popover-trigger]')) setPopover(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [popover]);

  /* ------------------------------------------------------------------ */
  /*  Commands                                                           */
  /* ------------------------------------------------------------------ */

  /**
   * `useCss` picks the markup execCommand produces: off gives semantic tags
   * (<b>, <i>), on gives inline styles — which is what we want for colour
   * and indentation, and only those.
   */
  const exec = useCallback(
    (command, arg = null, useCss = false) => {
      const el = editorRef.current;
      if (!el) return;
      restoreSelection();
      try {
        document.execCommand('styleWithCSS', false, useCss);
      } catch {
        /* not supported — the default markup is still fine */
      }
      try {
        document.execCommand(command, false, arg);
      } catch {
        /* command unavailable in this browser; nothing to undo */
      }
      saveSelection();
      emit();
      refreshState();
    },
    [restoreSelection, saveSelection, emit, refreshState]
  );

  // Step the current selection's font size up or down through the legacy 1–7
  // scale. Uses the built-in `fontSize` command with styleWithCSS off so it
  // emits <font size="n">, which round-trips cleanly through the sanitizer.
  const changeFontSize = useCallback(
    (delta) => {
      const el = editorRef.current;
      if (!el) return;
      restoreSelection();
      let current = parseInt(document.queryCommandValue('fontSize'), 10);
      if (!Number.isInteger(current) || current < 1 || current > 7) current = 3;
      const next = Math.min(7, Math.max(1, current + delta));
      exec('fontSize', String(next));
    },
    [restoreSelection, exec]
  );

  const setBlock = useCallback(
    (tag) => {
      exec('formatBlock', '<' + tag + '>');
    },
    [exec]
  );

  const toggleBlockquote = useCallback(() => {
    setBlock(state.block === 'blockquote' ? 'p' : 'blockquote');
  }, [setBlock, state.block]);

  const insertMoreTag = useCallback(() => {
    const html =
      '<div class="' + MORE_CLASS + '" ' + MORE_ATTR + '="1" contenteditable="false"></div><p><br></p>';
    exec('insertHTML', html);
  }, [exec]);

  const clearFormatting = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    restoreSelection();
    try {
      document.execCommand('styleWithCSS', false, false);
      document.execCommand('removeFormat');
      document.execCommand('unlink');
      // removeFormat leaves block-level formatting alone; WordPress resets it.
      document.execCommand('formatBlock', false, '<p>');
    } catch {
      /* ignore */
    }
    saveSelection();
    emit();
    refreshState();
  }, [restoreSelection, saveSelection, emit, refreshState]);

  const openLinkDialog = useCallback(() => {
    saveSelection();
    const existing = anchorAtCaret();
    setLinkUrl(existing ? existing.getAttribute('href') || '' : '');
    setLinkNewTab(existing ? existing.getAttribute('target') === '_blank' : false);
    setLinkError('');
    setPopover((p) => (p === 'link' ? null : 'link'));
  }, [saveSelection, anchorAtCaret]);

  const applyLink = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const url = normalizeLinkUrl(linkUrl);
    if (!url) {
      setLinkError('Enter a valid http(s), mailto, tel or site-relative URL.');
      return;
    }
    setLinkError('');

    restoreSelection();
    const existing = anchorAtCaret();

    if (existing) {
      existing.setAttribute('href', url);
      if (linkNewTab) {
        existing.setAttribute('target', '_blank');
        existing.setAttribute('rel', 'noopener noreferrer');
      } else {
        existing.removeAttribute('target');
        existing.removeAttribute('rel');
      }
    } else {
      const sel = window.getSelection();
      const collapsed = !sel || sel.isCollapsed;
      if (collapsed) {
        // Nothing selected — WordPress drops the URL in as its own link text.
        const escaped = url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const target = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
        document.execCommand('insertHTML', false, '<a href="' + escaped + '"' + target + '>' + escaped + '</a>');
      } else {
        document.execCommand('createLink', false, url);
        if (linkNewTab) {
          for (const a of el.querySelectorAll('a[href]')) {
            if (a.getAttribute('href') === url && sel.containsNode(a, true)) {
              a.setAttribute('target', '_blank');
              a.setAttribute('rel', 'noopener noreferrer');
            }
          }
        }
      }
    }

    setPopover(null);
    saveSelection();
    emit();
    refreshState();
  }, [linkUrl, linkNewTab, restoreSelection, anchorAtCaret, saveSelection, emit, refreshState]);

  const removeLink = useCallback(() => {
    setPopover(null);
    exec('unlink');
  }, [exec]);

  const insertChar = useCallback(
    (char) => {
      exec('insertText', char);
    },
    [exec]
  );

  const applyColor = useCallback(
    (color) => {
      const hex = normalizeHex(color) || color;
      setRecentColors((prev) => [hex, ...prev.filter((c) => c !== hex)].slice(0, 8));
      setCustomColor(hex);
      setCustomHex(hex);
      setPopover(null);
      exec('foreColor', hex, true);
    },
    [exec]
  );

  /** Apply whatever is currently in the free-form hex field. */
  const applyCustomColor = useCallback(() => {
    const hex = normalizeHex(customHex);
    if (!hex) return;
    applyColor(hex);
  }, [customHex, applyColor]);

  /* ------------------------------------------------------------------ */
  /*  Editor events                                                      */
  /* ------------------------------------------------------------------ */

  const onPaste = useCallback(
    (e) => {
      e.preventDefault();
      const data = e.clipboardData;
      if (!data) return;
      const text = data.getData('text/plain');
      const html = data.getData('text/html');

      if (pasteAsText || !html) {
        document.execCommand('insertText', false, text);
      } else {
        document.execCommand('insertHTML', false, sanitizeHtml(html));
      }
      emit();
      refreshState();
    },
    [pasteAsText, emit, refreshState]
  );

  const onKeyDown = useCallback(
    (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.altKey) return;

      if (mod && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openLinkDialog();
        return;
      }
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setShowAdvanced((v) => !v);
        return;
      }
      // Let the browser handle Ctrl+B/I/U/Z/Y natively, then resync.
      if (mod) {
        window.setTimeout(() => {
          emit();
          refreshState();
        }, 0);
      }
    },
    [openLinkDialog, emit, refreshState]
  );

  /* ------------------------------------------------------------------ */
  /*  Visual <-> HTML mode                                               */
  /* ------------------------------------------------------------------ */

  const switchMode = useCallback(
    (next) => {
      if (next === mode) return;
      setPopover(null);
      if (next === 'html') {
        const el = editorRef.current;
        if (el) {
          const stored = toStoredHtml(el.innerHTML);
          lastEmittedRef.current = stored;
          onChange(stored);
        }
      } else {
        // Coming back from HTML — force the effect to reload the editor.
        lastEmittedRef.current = null;
      }
      setMode(next);
    },
    [mode, onChange]
  );

  const words = countWords(value || '');

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  const tabClass = (activeTab) =>
    cn(
      'rounded-t-lg border border-b-0 px-4 py-1.5 text-xs font-semibold transition-colors',
      activeTab
        ? 'border-black/10 bg-white text-primary'
        : 'border-transparent bg-transparent text-primary/45 hover:text-primary/70'
    );

  return (
    <div className="rounded-2xl border border-black/10 bg-sand-50 focus-within:border-accent">
      {/* Visual / Text tabs — the classic editor's mode switch */}
      <div className="flex items-center justify-between gap-2 px-3 pt-2">
        <div className="flex items-end gap-1">
          <button
            type="button"
            onClick={() => switchMode('visual')}
            className={tabClass(mode === 'visual')}
          >
            <span className="flex items-center gap-1.5">
              <VisualTabIcon className="h-3.5 w-3.5" />
              Visual
            </span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('html')}
            className={tabClass(mode === 'html')}
          >
            <span className="flex items-center gap-1.5">
              <CodeTabIcon className="h-3.5 w-3.5" />
              Text
            </span>
          </button>
        </div>
        {pasteAsText && mode === 'visual' && (
          <span className="pb-1.5 text-[0.65rem] font-semibold uppercase tracking-widest text-accent-dark">
            Paste as text on
          </span>
        )}
      </div>

      {mode === 'visual' ? (
        <>
          {/* ---------------- Toolbar ---------------- */}
          <div
            role="toolbar"
            aria-label="Formatting"
            aria-controls={id}
            className="relative rounded-t-none border-y border-black/10 bg-sand-100/70 px-2 py-1.5"
          >
            {/* Primary row */}
            <div className="flex flex-wrap items-center gap-0.5">
              <select
                aria-label="Paragraph format"
                value={BLOCK_FORMATS.some((f) => f.value === state.block) ? state.block : 'p'}
                onMouseDown={saveSelection}
                onChange={(e) => setBlock(e.target.value)}
                className="mr-1 h-8 rounded-lg border border-black/10 bg-white px-2 text-xs font-medium text-primary outline-none transition-colors hover:border-black/20 focus:border-accent"
              >
                {BLOCK_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
                {state.block === 'blockquote' && <option value="blockquote">Quote</option>}
              </select>

              <TB icon={BoldIcon} label="Bold (Ctrl+B)" active={state.bold} onClick={() => exec('bold')} />
              <TB icon={ItalicIcon} label="Italic (Ctrl+I)" active={state.italic} onClick={() => exec('italic')} />

              <Divider />

              <TB
                icon={FontDecreaseIcon}
                label="Decrease font size"
                disabled={state.fontSize === '1'}
                onClick={() => changeFontSize(-1)}
              />
              <TB
                icon={FontIncreaseIcon}
                label="Increase font size"
                disabled={state.fontSize === '7'}
                onClick={() => changeFontSize(1)}
              />

              <Divider />

              <TB
                icon={BulletListIcon}
                label="Bulleted list"
                active={state.insertUnorderedList}
                onClick={() => exec('insertUnorderedList')}
              />
              <TB
                icon={NumberListIcon}
                label="Numbered list"
                active={state.insertOrderedList}
                onClick={() => exec('insertOrderedList')}
              />
              <TB
                icon={QuoteIcon}
                label="Blockquote"
                active={state.block === 'blockquote'}
                onClick={toggleBlockquote}
              />

              <Divider />

              <TB icon={AlignLeftIcon} label="Align left" active={state.justifyLeft} onClick={() => exec('justifyLeft')} />
              <TB icon={AlignCenterIcon} label="Align center" active={state.justifyCenter} onClick={() => exec('justifyCenter')} />
              <TB icon={AlignRightIcon} label="Align right" active={state.justifyRight} onClick={() => exec('justifyRight')} />

              <Divider />

              <span data-rte-popover-trigger>
                <TB icon={LinkIcon} label="Insert/edit link (Ctrl+K)" active={popover === 'link' || hasLink} onClick={openLinkDialog} />
              </span>
              <TB icon={ReadMoreIcon} label="Insert Read More tag" onClick={insertMoreTag} />

              <Divider />

              <TB
                icon={KitchenSinkIcon}
                label="Toolbar Toggle (Alt+Shift+Z)"
                active={showAdvanced}
                onClick={() => setShowAdvanced((v) => !v)}
              />
            </div>

            {/* Advanced row */}
            {showAdvanced && (
              <div className="mt-1.5 flex flex-wrap items-center gap-0.5 border-t border-black/10 pt-1.5">
                <TB
                  icon={StrikethroughIcon}
                  label="Strikethrough"
                  active={state.strikeThrough}
                  onClick={() => exec('strikeThrough')}
                />
                <TB icon={HorizontalRuleIcon} label="Horizontal line" onClick={() => exec('insertHorizontalRule')} />

                <span data-rte-popover-trigger>
                  <TB
                    icon={TextColorIcon}
                    label="Text color"
                    active={popover === 'color'}
                    onClick={() => {
                      saveSelection();
                      setPopover((p) => (p === 'color' ? null : 'color'));
                    }}
                  />
                </span>

                <TB
                  icon={PasteTextIcon}
                  label="Paste as text"
                  active={pasteAsText}
                  onClick={() => setPasteAsText((v) => !v)}
                />
                <TB icon={ClearFormattingIcon} label="Clear formatting" onClick={clearFormatting} />

                <span data-rte-popover-trigger>
                  <TB
                    icon={SpecialCharIcon}
                    label="Special character"
                    active={popover === 'chars'}
                    onClick={() => {
                      saveSelection();
                      setPopover((p) => (p === 'chars' ? null : 'chars'));
                    }}
                  />
                </span>

                <Divider />

                <TB icon={OutdentIcon} label="Decrease indent" onClick={() => exec('outdent', null, true)} />
                <TB icon={IndentIcon} label="Increase indent" onClick={() => exec('indent', null, true)} />

                <Divider />

                <TB icon={UndoIcon} label="Undo (Ctrl+Z)" onClick={() => exec('undo')} />
                <TB icon={RedoIcon} label="Redo (Ctrl+Y)" onClick={() => exec('redo')} />

                {hasLink && (
                  <>
                    <Divider />
                    <TB icon={UnlinkIcon} label="Remove link" onClick={removeLink} />
                  </>
                )}
              </div>
            )}

            {/* ---------------- Popovers ---------------- */}
            {popover === 'link' && (
              <div
                data-rte-popover
                className="absolute left-2 right-2 top-full z-30 mt-1 rounded-2xl border border-black/10 bg-white p-4 shadow-luxe sm:right-auto sm:w-96"
              >
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-primary/60">
                  Link URL
                </label>
                <input
                  autoFocus
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    if (linkError) setLinkError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyLink();
                    }
                  }}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-black/10 bg-sand-50 px-3 py-2 text-sm text-primary outline-none transition-colors focus:border-accent focus:bg-white"
                />
                {linkError && (
                  <p className="mt-2 text-xs text-red-600">{linkError}</p>
                )}
                <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-primary/70">
                  <input
                    type="checkbox"
                    checked={linkNewTab}
                    onChange={(e) => setLinkNewTab(e.target.checked)}
                    className="h-4 w-4 accent-accent"
                  />
                  Open link in a new tab
                </label>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={applyLink}
                    disabled={!linkUrl.trim()}
                    className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-soft disabled:opacity-40"
                  >
                    Apply
                  </button>
                  {hasLink && (
                    <button
                      type="button"
                      onClick={removeLink}
                      className="rounded-full px-4 py-2 text-xs font-semibold text-primary/60 transition-colors hover:bg-black/5 hover:text-primary"
                    >
                      Remove link
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPopover(null)}
                    className="ml-auto rounded-full px-3 py-2 text-xs font-medium text-primary/45 transition-colors hover:text-primary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ---------------- Colour plate card ---------------- */}
          {popover === 'color' && (
            <EditorModal
              title="Text color"
              description="Pick from the plate, or build any colour you like."
              width="max-w-xl"
              onClose={() => setPopover(null)}
            >
              <section>
                <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary/45">
                  Theme
                </h4>
                <div className="mt-2.5 grid grid-cols-8 gap-2">
                  {THEME_COLORS.map((c) => (
                    <Swatch
                      key={c.value}
                      value={c.value}
                      label={c.label}
                      selected={c.value === customColor}
                      onPick={applyColor}
                    />
                  ))}
                </div>
              </section>

              <section className="mt-5">
                <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary/45">
                  Brand
                </h4>
                <div className="mt-2.5 grid grid-cols-8 gap-2">
                  {BRAND_COLORS.map((c) => (
                    <Swatch
                      key={c.value}
                      value={c.value}
                      label={c.label}
                      selected={c.value === customColor}
                      onPick={applyColor}
                    />
                  ))}
                </div>
              </section>

              <section className="mt-5">
                <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary/45">
                  Standard
                </h4>
                <div className="mt-2.5 grid grid-cols-8 gap-2">
                  {SHADE_LEVELS.map((shade) =>
                    SPECTRUM.map((hue) => (
                      <Swatch
                        key={hue.label + shade}
                        value={hue.shades[shade]}
                        label={hue.label + ' ' + (shade + 1)}
                        selected={hue.shades[shade] === customColor}
                        onPick={applyColor}
                      />
                    ))
                  )}
                </div>
              </section>

              {recentColors.length > 0 && (
                <section className="mt-5">
                  <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary/45">
                    Recent
                  </h4>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {recentColors.map((c) => (
                      <Swatch key={'recent-' + c} value={c} label={c} onPick={applyColor} />
                    ))}
                  </div>
                </section>
              )}

              {/* Free-form colour builder */}
              <section className="mt-6 rounded-2xl border border-black/10 bg-sand-50 p-4">
                <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary/45">
                  Custom color
                </h4>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    type="color"
                    aria-label="Custom color picker"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setCustomHex(e.target.value);
                    }}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-black/15 bg-transparent p-1"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary/45">Hex</span>
                    <input
                      aria-label="Custom color hex value"
                      value={customHex}
                      onChange={(e) => {
                        const next = e.target.value;
                        setCustomHex(next);
                        const hex = normalizeHex(next);
                        if (hex) setCustomColor(hex);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          applyCustomColor();
                        }
                      }}
                      placeholder="#c8a24a"
                      spellCheck={false}
                      className={cn(
                        'w-28 rounded-xl border bg-white px-3 py-2 font-mono text-xs text-primary outline-none transition-colors',
                        normalizeHex(customHex)
                          ? 'border-black/10 focus:border-accent'
                          : 'border-red-300 focus:border-red-400'
                      )}
                    />
                  </div>
                  <span
                    aria-hidden="true"
                    className="h-10 w-10 rounded-lg border border-black/15"
                    style={{ backgroundColor: normalizeHex(customHex) || 'transparent' }}
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={applyCustomColor}
                    disabled={!normalizeHex(customHex)}
                    className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary-soft disabled:opacity-40"
                  >
                    Apply color
                  </button>
                </div>
                {!normalizeHex(customHex) && (
                  <p className="mt-2 text-xs text-red-600">
                    Enter a hex value such as #c8a24a or #ca4.
                  </p>
                )}
              </section>

              <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setPopover(null);
                    exec('removeFormat');
                  }}
                  className="text-xs font-semibold text-primary/50 transition-colors hover:text-primary"
                >
                  Remove color
                </button>
                <button
                  type="button"
                  onClick={() => setPopover(null)}
                  className="rounded-full px-4 py-2 text-xs font-medium text-primary/45 transition-colors hover:text-primary"
                >
                  Cancel
                </button>
              </div>
            </EditorModal>
          )}

          {/* ---------------- Special character card ---------------- */}
          {popover === 'chars' && (
            <EditorModal
              title="Special character"
              description="Choose a character to insert at the cursor."
              width="max-w-2xl"
              onClose={() => setPopover(null)}
            >
              {/* Preview of whatever is hovered or focused */}
              <div className="mb-5 flex items-center gap-4 rounded-2xl border border-black/10 bg-sand-50 px-4 py-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white font-serif text-3xl text-primary">
                  {charPreview || '\u2014'}
                </span>
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary/45">
                    {charPreview ? 'Preview' : 'Hover a character'}
                  </p>
                  <p className="mt-1 font-mono text-xs text-primary/60">
                    {charPreview
                      ? entityLabel(charPreview)
                      : 'Its HTML entity and code point appear here.'}
                  </p>
                </div>
              </div>

              {SPECIAL_CHAR_GROUPS.map((group) => (
                <section key={group.label} className="mb-5 last:mb-0">
                  <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary/45">
                    {group.label}
                  </h4>
                  <div className="mt-2.5 grid grid-cols-8 gap-1.5 sm:grid-cols-12">
                    {group.chars.map((char) => (
                      <button
                        key={group.label + char}
                        type="button"
                        title={codePointLabel(char)}
                        aria-label={'Insert ' + char}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setCharPreview(char)}
                        onFocus={() => setCharPreview(char)}
                        onClick={() => {
                          setPopover(null);
                          insertChar(char);
                        }}
                        className="flex h-9 items-center justify-center rounded-lg border border-transparent text-base text-primary transition-colors hover:border-black/10 hover:bg-sand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </EditorModal>
          )}

          {/* ---------------- Editable surface ---------------- */}
          <div className="relative">
            {isEmpty && (
              <p className="pointer-events-none absolute left-5 top-4 text-sm text-primary/35">
                {placeholder}
              </p>
            )}
            <div
              id={id}
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-multiline="true"
              aria-label="Product description"
              spellCheck
              onInput={emit}
              onBlur={emit}
              onPaste={onPaste}
              onKeyDown={onKeyDown}
              onKeyUp={refreshState}
              onMouseUp={refreshState}
              className="rte-content w-full overflow-y-auto bg-white px-5 py-4 text-sm text-primary outline-none"
              style={{ minHeight }}
            />
          </div>
        </>
      ) : (
        /* ---------------- HTML source mode ---------------- */
        <textarea
          id={id}
          value={value || ''}
          onChange={(e) => {
            lastEmittedRef.current = e.target.value;
            onChange(e.target.value);
          }}
          spellCheck={false}
          placeholder="<p>HTML source…</p>"
          className="w-full rounded-none border-y border-black/10 bg-white px-5 py-4 font-mono text-xs leading-relaxed text-primary outline-none"
          style={{ minHeight: minHeight + 44 }}
        />
      )}

      {/* ---------------- Status bar ---------------- */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 text-[0.7rem] text-primary/40">
        <span>
          {mode === 'visual'
            ? 'Formatting is saved as HTML.'
            : 'Editing raw HTML — unsupported tags are stripped on save.'}
        </span>
        <span>
          {words} word{words === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}
