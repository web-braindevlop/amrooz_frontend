'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import Button from '@/components/ui/Button';
import {
  HeartIcon,
  CartIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
  RefreshIcon,
  ShieldIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';
import { cn, formatPrice, discountPercent } from '@/utils/format';
import { fetchProducts } from '@/lib/products';
import { useCart } from '@/lib/cart/CartContext';
import { useToast } from '@/components/ui/ToastProvider';

/* Stable gradient placeholder per category, used when no imageUrl exists. */
const CATEGORY_GRADIENT = {
  women: 'from-[#3a2a2f] via-[#241b20] to-[#17150f]',
  men: 'from-[#233040] via-[#1b232d] to-[#17150f]',
  accessories: 'from-[#3a2f1a] via-[#241f14] to-[#17150f]',
  default: 'from-[#2c2820] via-[#201d17] to-[#17150f]',
};

/**
 * Parse a stored sale schedule value into a timestamp (ms). Values are local
 * ISO datetimes ("YYYY-MM-DDTHH:mm:ss", no timezone). Legacy date-only values
 * ("YYYY-MM-DD") are treated as the start or end of that day so older products
 * keep behaving as before.
 */
function parseSaleInstant(value, endOfDayIfDateOnly = false) {
  if (!value) return null;
  let s = String(value).replace(' ', 'T');
  if (s.length <= 10) s = `${s}T${endOfDayIfDateOnly ? '23:59:59' : '00:00:00'}`;
  const t = new Date(s).getTime();
  return Number.isNaN(t) ? null : t;
}

/** Whether a variant's sale price is within its scheduled window right now (both ends optional). */
function isSaleWindowActive(variant) {
  const now = Date.now();
  const start = parseSaleInstant(variant.saleStartDate, false);
  const end = parseSaleInstant(variant.saleEndDate, true);
  if (start != null && now < start) return false;
  if (end != null && now > end) return false;
  return true;
}

/**
 * Resolves the effective regular/sale price for the selected variant.
 * A variant with neither override inherits the product's pricing (including
 * any product-level sale). Setting priceOverride gives it its own regular
 * price and opts it out of the product's sale unless salePrice is also set.
 * A salePrice outside its scheduled window is treated as if it weren't set.
 */
function resolveVariantPricing(product, variant) {
  if (!variant) return { price: product.price, originalPrice: product.originalPrice ?? null, saleEndDate: null };

  const hasOwnRegular = variant.priceOverride != null;
  const hasOwnSale = variant.salePrice != null && isSaleWindowActive(variant);

  if (!hasOwnRegular && !hasOwnSale) {
    return { price: product.price, originalPrice: product.originalPrice ?? null, saleEndDate: null };
  }

  const regular = hasOwnRegular ? variant.priceOverride : product.originalPrice ?? product.price;
  if (hasOwnSale) {
    return { price: variant.salePrice, originalPrice: regular, saleEndDate: variant.saleEndDate || null };
  }
  return { price: regular, originalPrice: null, saleEndDate: null };
}

export default function ProductDetail({ product }) {
  const { addItem } = useCart();
  const toast = useToast();
  const [activeImage, setActiveImage] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  // Bumped by a countdown when a sale window opens or closes, so the memoised
  // pricing below re-resolves at that instant without a page reload.
  const [saleBump, setSaleBump] = useState(0);

  const gradient = CATEGORY_GRADIENT[product.category] || CATEGORY_GRADIENT.default;

  const isExternal = product.type === 'external';
  const isGrouped = product.type === 'grouped';

  const sizes = useMemo(
    () => Array.from(new Set((product.variants || []).map((v) => v.size).filter(Boolean))),
    [product.variants],
  );
  const colorOptions = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const v of product.variants || []) {
      if (v.colorHex && !seen.has(v.colorHex)) {
        seen.add(v.colorHex);
        list.push({ hex: v.colorHex, name: v.color || v.colorHex });
      }
    }
    return list;
  }, [product.variants]);

  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);
  const [selectedColorHex, setSelectedColorHex] = useState(colorOptions[0]?.hex || null);
  const selectedColorName = colorOptions.find((c) => c.hex === selectedColorHex)?.name || null;

  const matchedVariant = useMemo(() => {
    if (!product.variants?.length) return null;
    return (
      product.variants.find(
        (v) =>
          (!sizes.length || v.size === selectedSize) &&
          (!colorOptions.length || v.colorHex === selectedColorHex),
      ) || null
    );
  }, [product.variants, sizes.length, colorOptions.length, selectedSize, selectedColorHex]);

  // A photo specific to the matched variation (e.g. this exact size shot
  // separately) leads the gallery; the rest of the selected color's shared
  // gallery follows, then the product's generic photos as the final fallback.
  const images = useMemo(() => {
    const own = matchedVariant?.imageUrl ? [matchedVariant.imageUrl] : [];
    const variantGallery = selectedColorName ? product.variantImages?.[selectedColorName] || [] : [];
    const combined = [...own, ...variantGallery.filter((url) => !own.includes(url))];
    if (combined.length) return combined;
    return Array.isArray(product.images) ? product.images : [];
  }, [product.images, product.variantImages, selectedColorName, matchedVariant]);

  // Jump back to the first photo of whichever gallery is now showing, and
  // clear any stale broken-image state from the previous color's gallery.
  useEffect(() => {
    setActiveImage(0);
    setImgError(false);
  }, [images]);

  const hasImages = images.length > 0 && !imgError;

  // True once both axes (when present) have a selection but no variant row
  // matches it — e.g. this color doesn't come in the selected size.
  const noMatchForSelection = !!product.variants?.length && !matchedVariant;
  const variantUnavailable = matchedVariant?.isActive === false;

  const stock = matchedVariant ? matchedVariant.stock : product.stock;
  const sku = matchedVariant?.sku || product.sku;
  const soldOut =
    !isGrouped &&
    !isExternal &&
    (noMatchForSelection || variantUnavailable || Number(stock) === 0);

  const { price, originalPrice, saleEndDate } = useMemo(
    () => resolveVariantPricing(product, matchedVariant),
    // `saleBump` forces a re-resolve when a countdown crosses a start/end boundary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product, matchedVariant, saleBump],
  );
  const discount = discountPercent(price, originalPrice);

  // A scheduled sale that hasn't started yet — pricing still shows the regular
  // price until it does, so this is surfaced separately to count down to it.
  const upcomingSale = useMemo(() => {
    const v = matchedVariant;
    if (!v || v.salePrice == null || !v.saleStartDate) return null;
    const start = parseSaleInstant(v.saleStartDate, false);
    if (start == null || Date.now() >= start) return null;
    return { startsAt: start, endDate: v.saleEndDate || null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedVariant, saleBump]);

  const handleAdd = () => {
    if (soldOut || added) return;
    const colorName = colorOptions.find((c) => c.hex === selectedColorHex)?.name || null;
    addItem(product, {
      quantity,
      price,
      size: selectedSize,
      colorHex: selectedColorHex,
      colorName,
      variantId: matchedVariant?.id ?? null,
      maxStock: Number(stock) || null,
    });
    setAdded(true);
    toast.success(
      quantity > 1
        ? `${quantity} × ${product.name} added to bag`
        : `${product.name} added to bag`,
    );
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs uppercase tracking-[0.2em] text-primary/40">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category || 'all'}`} className="hover:text-primary">
          {product.categoryName || 'Shop'}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-accent-dark">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-sand-100">
            {hasImages ? (
              <img
                src={images[activeImage] || images[0]}
                alt={product.name}
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <PlaceholderArt gradient={gradient} name={product.name} />
            )}

            <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
              {product.isNew && !soldOut && <Badge tone="new">New</Badge>}
              {discount > 0 && !soldOut && <Badge tone="sale">-{discount}%</Badge>}
              {soldOut && <Badge tone="soldout">Sold Out</Badge>}
            </div>

            {/* Sale timer overlaid on the photo — an active sale counts down to
                its end; an upcoming scheduled sale counts down to its start. */}
            {!isGrouped && !isExternal && !soldOut && discount > 0 && saleEndDate && (
              <SaleCountdown
                variant="overlay"
                target={parseSaleInstant(saleEndDate, true)}
                label="Sale ends in"
                endDateLabel={saleEndDate}
                onExpire={() => setSaleBump((n) => n + 1)}
              />
            )}
            {!isGrouped && !isExternal && !soldOut && upcomingSale && (
              <SaleCountdown
                variant="overlay"
                tone="upcoming"
                target={upcomingSale.startsAt}
                label="Starts in"
                endDateLabel={upcomingSale.endDate}
                startLabel={matchedVariant?.saleStartDate}
                onExpire={() => setSaleBump((n) => n + 1)}
              />
            )}
          </div>

          {hasImages && images.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((url, i) => (
                <button
                  key={url + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    'h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
                    activeImage === i ? 'border-accent' : 'border-transparent hover:border-black/10',
                  )}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="eyebrow text-accent-dark">{product.brand}</p>}
          <h1 className="mt-2 font-serif text-3xl leading-tight text-primary sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Rating value={product.rating} count={product.reviewCount} size="md" />
            {sku && <span className="text-xs text-primary/40">SKU: {sku}</span>}
          </div>

          {!isGrouped && (
            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-semibold text-primary">{formatPrice(price)}</span>
              {discount > 0 && (
                <span className="text-base text-primary/40 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              {discount > 0 && <Badge tone="sale">Save {discount}%</Badge>}
            </div>
          )}

          {product.shortDescription && (
            <div
              className="rte-content mt-5 text-[0.95rem] text-primary/70"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          )}

          {/* Variant selectors */}
          {colorOptions.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary/60">
                Color
              </p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColorHex(c.hex)}
                    title={c.name}
                    aria-label={c.name}
                    aria-pressed={selectedColorHex === c.hex}
                    className={cn(
                      'h-9 w-9 rounded-full border-2 shadow-inner transition-all',
                      selectedColorHex === c.hex ? 'border-primary scale-110' : 'border-black/10',
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary/60">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    aria-pressed={selectedSize === s}
                    className={cn(
                      'rounded-xl border px-4 py-2 text-sm font-medium transition-colors',
                      selectedSize === s
                        ? 'border-primary bg-primary text-white'
                        : 'border-black/10 text-primary hover:border-primary',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock status */}
          {!isExternal && !isGrouped && (
            <p
              className={cn(
                'mt-5 text-sm font-medium',
                soldOut
                  ? 'text-red-600'
                  : Number(stock) <= 5
                  ? 'text-accent-dark'
                  : 'text-emerald-600',
              )}
            >
              {noMatchForSelection
                ? 'This combination is currently unavailable'
                : variantUnavailable
                ? 'This variation is currently unavailable'
                : soldOut
                ? 'Out of stock'
                : Number(stock) <= 5
                ? `Only ${stock} left in stock`
                : 'In stock'}
            </p>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isExternal ? (
              <Button
                href={product.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                iconRight={<ArrowRightIcon className="h-4 w-4" />}
              >
                {product.buttonText || 'Buy Now'}
              </Button>
            ) : (
              !isGrouped && (
                <>
                  <div className="flex items-center rounded-full border border-black/10">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={soldOut}
                      className="flex h-12 w-11 items-center justify-center text-primary/60 transition-colors hover:text-primary disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-primary">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => (stock ? Math.min(Number(stock), q + 1) : q + 1))}
                      disabled={soldOut}
                      className="flex h-12 w-11 items-center justify-center text-primary/60 transition-colors hover:text-primary disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <Button
                    type="button"
                    onClick={handleAdd}
                    disabled={soldOut}
                    size="lg"
                    variant={added ? 'gold' : 'primary'}
                    iconLeft={added ? <CheckIcon className="h-4 w-4" /> : <CartIcon className="h-4 w-4" />}
                    className="flex-1 sm:flex-none"
                  >
                    {soldOut ? 'Sold Out' : added ? 'Added to Cart' : 'Add to Cart'}
                  </Button>
                </>
              )
            )}

            <button
              type="button"
              onClick={() => setWished((v) => !v)}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={wished}
              className={cn(
                'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors',
                wished ? 'border-[#c0392b] text-[#c0392b]' : 'border-black/10 text-primary hover:border-primary',
              )}
            >
              <HeartIcon className="h-5 w-5" style={wished ? { fill: 'currentColor' } : undefined} />
            </button>
          </div>

          {/* Meta */}
          {(product.categoryName || product.tags?.length > 0) && (
            <dl className="mt-8 space-y-2 border-t border-black/5 pt-6 text-sm">
              {product.categoryName && (
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-primary/40">Category</dt>
                  <dd className="text-primary/70">{product.categoryName}</dd>
                </div>
              )}
              {product.tags?.length > 0 && (
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-primary/40">Tags</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {product.tags.map((t) => (
                      <Badge key={t.id} tone="neutral">
                        {t.name}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          )}

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-1 gap-4 rounded-2xl bg-sand-50 p-5 sm:grid-cols-3">
            <TrustItem Icon={TruckIcon} text="Delivery charges Rs 250" />
            <TrustItem Icon={RefreshIcon} text="30-day easy returns" />
            <TrustItem Icon={ShieldIcon} text="Secure checkout" />
          </div>
        </div>
      </div>

      {isGrouped && Array.isArray(product.groupedProductIds) && product.groupedProductIds.length > 0 && (
        <GroupedItems productIds={product.groupedProductIds} />
      )}

      {/* Description + Reviews */}
      <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="font-serif text-2xl text-primary">Description</h2>
          {product.description ? (
            <div
              className="rte-content mt-4 text-primary/70"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          ) : (
            <p className="mt-4 text-sm text-primary/50">No description provided yet.</p>
          )}
        </div>

        <ProductReviews
          reviews={product.reviews}
          rating={product.rating}
          reviewCount={product.reviewCount}
        />
      </div>
    </section>
  );
}

function TrustItem({ Icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 shrink-0 text-accent-dark" />
      <span className="text-xs font-medium text-primary/70">{text}</span>
    </div>
  );
}

/** Format a millisecond remainder as "2d 03h 15m 42s" (days omitted when zero). */
function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${days > 0 ? `${days}d ` : ''}${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

/**
 * Live sale timer. Ticks every second toward `target` (ms epoch) and calls
 * `onExpire` once when it reaches zero so the parent can re-resolve pricing.
 * Renders nothing until mounted (keeps SSR and the first client render identical,
 * avoiding a hydration mismatch from the ever-changing clock).
 */
function SaleCountdown({ target, label, tone = 'active', variant = 'inline', endDateLabel, startLabel, onExpire, className }) {
  const [remaining, setRemaining] = useState(null);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    let fired = false;
    const tick = () => {
      const r = target - Date.now();
      setRemaining(r);
      if (r <= 0 && !fired) {
        fired = true;
        onExpireRef.current?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (remaining === null || remaining <= 0) return null;

  const fmt = (d) => {
    const t = parseSaleInstant(d, false);
    return t == null
      ? ''
      : new Date(t).toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
  };
  const title =
    tone === 'upcoming'
      ? [startLabel && `Sale starts ${fmt(startLabel)}`, endDateLabel && `ends ${fmt(endDateLabel)}`]
          .filter(Boolean)
          .join(' · ')
      : endDateLabel
        ? `Sale ends ${fmt(endDateLabel)}`
        : undefined;

  // Prominent overlay for the product image: segmented D/H/M/S boxes on a
  // dark, blurred pill so the time reads clearly over any photo.
  if (variant === 'overlay') {
    const total = Math.max(0, Math.floor(remaining / 1000));
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    const pad = (n) => String(n).padStart(2, '0');
    const segs = [];
    if (days > 0) segs.push([pad(days), 'Days']);
    segs.push([pad(hours), 'Hrs'], [pad(minutes), 'Min'], [pad(seconds), 'Sec']);

    return (
      <div
        className={cn(
          'pointer-events-none absolute inset-x-3 bottom-3 flex justify-center',
          className,
        )}
      >
        <div
          title={title || undefined}
          className="pointer-events-auto flex items-center gap-2.5 rounded-2xl bg-primary/85 px-3 py-2 text-white shadow-luxe backdrop-blur-md"
        >
          <span
            className={cn(
              'flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em]',
              tone === 'upcoming' ? 'text-white/75' : 'text-accent-soft',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'inline-block h-1.5 w-1.5 rounded-full',
                tone === 'upcoming' ? 'bg-white/50' : 'animate-pulse bg-accent',
              )}
            />
            {label}
          </span>
          <div className="flex items-center gap-1">
            {segs.map(([val, lab]) => (
              <div
                key={lab}
                className="flex min-w-[2.15rem] flex-col items-center rounded-lg bg-white/15 px-1.5 py-1"
              >
                <span className="text-sm font-bold leading-none tabular-nums">{val}</span>
                <span className="mt-0.5 text-[0.5rem] uppercase leading-none tracking-wide text-white/70">
                  {lab}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      title={title || undefined}
      className={cn(
        'flex w-full items-center gap-2 text-xs font-medium',
        tone === 'upcoming' ? 'text-primary/55' : 'text-accent-dark',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-1.5 w-1.5 shrink-0 rounded-full',
          tone === 'upcoming' ? 'bg-primary/40' : 'animate-pulse bg-accent',
        )}
      />
      <span>{label}</span>
      <span className="font-semibold tabular-nums text-primary">{formatCountdown(remaining)}</span>
    </div>
  );
}

function PlaceholderArt({ gradient, name }) {
  const initial = (name || 'A').trim().charAt(0).toUpperCase();
  return (
    <div className={cn('flex h-full w-full items-center justify-center bg-gradient-to-br', gradient)}>
      <div className="text-center">
        <div className="font-serif text-7xl font-semibold text-white/15">{initial}</div>
        <div className="mt-1 text-[0.6rem] uppercase tracking-[0.4em] text-white/30">Amrooz</div>
      </div>
    </div>
  );
}

/** Child products of a grouped/bundle product, fetched by id and shown as a mini grid. */
function GroupedItems({ productIds }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await fetchProducts();
      if (alive) {
        setItems(data.filter((p) => productIds.includes(p.id)));
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [productIds]);

  if (loading || !items.length) return null;

  return (
    <div className="mt-12 rounded-3xl border border-black/5 bg-sand-50 p-6">
      <h2 className="font-serif text-xl text-primary">This bundle includes</h2>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`} className="group block">
            <div className="aspect-square overflow-hidden rounded-xl bg-white">
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-2xl text-primary/20">
                  {(p.name || 'A').charAt(0)}
                </div>
              )}
            </div>
            <p className="mt-2 truncate text-sm font-medium text-primary transition-colors group-hover:text-accent-dark">
              {p.name}
            </p>
            <p className="text-xs text-primary/50">{formatPrice(p.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProductReviews({ reviews = [], rating, reviewCount }) {
  return (
    <div className="lg:border-l lg:border-black/5 lg:pl-10">
      <h2 className="font-serif text-2xl text-primary">Reviews</h2>
      <div className="mt-3">
        <Rating value={rating} count={reviewCount} size="md" />
      </div>

      {!reviews?.length ? (
        <p className="mt-6 text-sm text-primary/50">
          No reviews yet — be the first to share your thoughts.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {reviews.map((r) => (
            <div key={r.id} className="border-t border-black/5 pt-5 first:border-0 first:pt-0">
              <Rating value={r.rating} size="sm" />
              {r.title && <p className="mt-2 font-medium text-primary">{r.title}</p>}
              {r.comment && <p className="mt-1 text-sm text-primary/65">{r.comment}</p>}
              <p className="mt-2 text-xs text-primary/40">
                {r.authorName || 'Anonymous'}
                {r.createdAt ? ` — ${new Date(r.createdAt).toLocaleDateString()}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
