'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const CartContext = createContext(null);

/* Bump the version suffix if the persisted shape ever changes. */
const STORAGE_KEY = 'amrooz_cart_v1';

/**
 * Stable per-line key so the *same* product+variant stacks into one line,
 * while different sizes/colors stay as separate lines.
 */
function lineKey({ id, size, colorHex, variantId }) {
  return [id, variantId || '', size || '', colorHex || ''].join('::');
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Coerce anything read from storage (or passed to addItem) into a safe line. */
function normalizeLine(raw) {
  if (!raw || raw.id == null) return null;
  const quantity = Math.max(1, Math.round(toNumber(raw.quantity, 1)));
  const maxStock =
    raw.maxStock == null ? null : Math.max(0, Math.round(toNumber(raw.maxStock, 0)));
  const size = raw.size || null;
  const colorHex = raw.colorHex || null;
  const variantId = raw.variantId ?? null;
  return {
    key: raw.key || lineKey({ id: raw.id, size, colorHex, variantId }),
    id: raw.id,
    variantId,
    name: String(raw.name ?? 'Product'),
    imageUrl: raw.imageUrl || null,
    category: raw.category || null,
    price: toNumber(raw.price, 0),
    size,
    colorHex,
    colorName: raw.colorName || null,
    quantity: maxStock ? Math.min(quantity, maxStock) : quantity,
    maxStock,
  };
}

function sanitize(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeLine).filter(Boolean);
}

/**
 * Client-side cart with localStorage persistence and cross-tab sync.
 *
 * Wrap the storefront in <CartProvider> and call useCart() anywhere beneath.
 * Components that call useCart() outside a provider get a safe, inert empty
 * cart back, so shared components never have to guard against a missing store.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  // `hydrated` flips true only after localStorage has been read on the client,
  // which keeps SSR output (empty cart) identical to the first client render.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(sanitize(JSON.parse(stored)));
    } catch {
      /* malformed / unavailable storage — start empty */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full or blocked — non-fatal, cart still works in-memory */
    }
  }, [items, hydrated]);

  // Reflect changes made in other tabs/windows.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        setItems(sanitize(e.newValue ? JSON.parse(e.newValue) : []));
      } catch {
        setItems([]);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback((product, opts = {}) => {
    if (!product || product.id == null) return;

    const size = opts.size ?? null;
    const colorHex = opts.colorHex ?? null;
    const variantId = opts.variantId ?? null;
    const quantity = Math.max(1, Math.round(toNumber(opts.quantity, 1)));
    const maxStock =
      opts.maxStock == null ? null : Math.max(0, Math.round(toNumber(opts.maxStock, 0)));
    const key = lineKey({ id: product.id, size, colorHex, variantId });

    setItems((prev) => {
      const idx = prev.findIndex((it) => it.key === key);
      if (idx !== -1) {
        const next = [...prev];
        const cap = next[idx].maxStock ?? maxStock;
        const merged = next[idx].quantity + quantity;
        next[idx] = { ...next[idx], quantity: cap ? Math.min(merged, cap) : merged };
        return next;
      }
      const line = normalizeLine({
        key,
        id: product.id,
        variantId,
        name: product.name,
        imageUrl:
          product.imageUrl ||
          (Array.isArray(product.images) ? product.images[0] : null) ||
          null,
        category: product.category,
        price: opts.price ?? product.price,
        size,
        colorHex,
        colorName: opts.colorName ?? null,
        quantity,
        maxStock,
      });
      return line ? [...prev, line] : prev;
    });
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.key !== key) return it;
        const q = Math.round(toNumber(quantity, it.quantity));
        const capped = it.maxStock ? Math.min(q, it.maxStock) : q;
        return { ...it, quantity: Math.max(1, capped) };
      }),
    );
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((n, it) => n + it.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      hydrated,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [items, count, subtotal, hydrated, addItem, updateQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

const EMPTY_CART = {
  items: [],
  count: 0,
  subtotal: 0,
  hydrated: false,
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clear: () => {},
};

/** Safe outside a <CartProvider> too — returns an inert empty cart. */
export function useCart() {
  return useContext(CartContext) || EMPTY_CART;
}
