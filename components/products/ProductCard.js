'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import { HeartIcon, CartIcon, EyeIcon, CheckIcon } from '@/components/ui/Icons';
import { cn, formatPrice, discountPercent } from '@/utils/format';
import { htmlToPlainText } from '@/lib/richText';
import { useCart } from '@/lib/cart/CartContext';
import { useWishlist } from '@/lib/wishlist/WishlistContext';
import { useToast } from '@/components/ui/ToastProvider';

/* Stable gradient placeholder per category, used when no imageUrl exists. */
const CATEGORY_GRADIENT = {
  women: 'from-[#3a2a2f] via-[#241b20] to-[#17150f]',
  men: 'from-[#233040] via-[#1b232d] to-[#17150f]',
  accessories: 'from-[#3a2f1a] via-[#241f14] to-[#17150f]',
  default: 'from-[#2c2820] via-[#201d17] to-[#17150f]',
};

export default function ProductCard({ product, priority = false }) {
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const toast = useToast();
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Sync wished state with wishlist context
  useEffect(() => {
    setWished(isInWishlist(product.id));
  }, [isInWishlist, product.id]);

  const soldOut = product.stock === 0;
  const discount = discountPercent(product.price, product.originalPrice);
  const gradient = CATEGORY_GRADIENT[product.category] || CATEGORY_GRADIENT.default;
  const showImage = product.imageUrl && !imgError;
  // Descriptions are authored as HTML in the admin editor — the card shows a
  // one-line teaser, so flatten it to text rather than leaking tags.
  const preview = htmlToPlainText(product.shortDescription) || htmlToPlainText(product.description);

  const handleWishlistToggle = () => {
    if (wished) {
      removeFromWishlist(product.id);
      toast.success(`Removed from wishlist`);
    } else {
      addToWishlist(product);
      toast.success(`Added to wishlist`);
    }
    setWished(!wished);
  };

  const handleAdd = () => {
    if (soldOut || added) return;
    // Quick-add from the grid uses the base product (no variant chosen here) —
    // the detail page is where size/colour are selected.
    addItem(product, {
      quantity: 1,
      price: product.price,
      maxStock: product.stock,
    });
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="group relative flex flex-col">
      {/* Media */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand-100">
        <Link href={`/products/${product.id}`} className="absolute inset-0" aria-label={product.name}>
          {showImage ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              loading={priority ? 'eager' : 'lazy'}
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
          ) : (
            <PlaceholderArt gradient={gradient} name={product.name} />
          )}
        </Link>

        {/* Subtle darkening on hover for control legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
          {product.isNew && !soldOut && <Badge tone="new">New</Badge>}
          {discount > 0 && !soldOut && <Badge tone="sale">-{discount}%</Badge>}
          {soldOut && <Badge tone="soldout">Sold Out</Badge>}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlistToggle}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wished}
          className={cn(
            'absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur transition-all duration-300',
            wished
              ? 'bg-white text-[#c0392b] scale-100'
              : 'bg-white/80 text-primary hover:bg-white'
          )}
        >
          <HeartIcon
            className="h-5 w-5"
            style={wished ? { fill: 'currentColor' } : undefined}
          />
        </button>

        {/* Quick view — fades in on hover (desktop) */}
        <Link
          href={`/products/${product.id}`}
          className="absolute bottom-3 left-3 hidden items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-primary opacity-0 backdrop-blur transition-all duration-500 group-hover:opacity-100 lg:inline-flex lg:translate-y-2 lg:group-hover:translate-y-0"
        >
          <EyeIcon className="h-4 w-4" /> Quick View
        </Link>

        {/* Add to cart — slides up on hover (desktop), always visible on touch */}
        <button
          onClick={handleAdd}
          disabled={soldOut}
          className={cn(
            'absolute bottom-3 right-3 inline-flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all duration-500 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100',
            soldOut
              ? 'cursor-not-allowed bg-white/70 text-primary/40'
              : added
              ? 'bg-emerald-600 text-white'
              : 'bg-primary text-white hover:bg-accent hover:text-primary'
          )}
          aria-label="Add to cart"
        >
          {added ? <CheckIcon className="h-5 w-5" /> : <CartIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col px-1 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="eyebrow text-[0.6rem] text-accent-dark">{product.category}</span>
          <Rating value={product.rating} count={product.reviewCount} />
        </div>

        <h3 className="mt-1.5 font-serif text-lg leading-snug text-primary">
          <Link href={`/products/${product.id}`} className="transition-colors hover:text-accent-dark">
            {product.name}
          </Link>
        </h3>

        {preview && (
          <p className="mt-1 line-clamp-1 text-sm text-primary/55">{preview}</p>
        )}

        {/* Color swatches */}
        {Array.isArray(product.colors) && product.colors.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            {product.colors.slice(0, 5).map((c, i) => (
              <span
                key={i}
                title={c}
                className="h-4 w-4 rounded-full border border-black/10 shadow-inner"
                style={{ backgroundColor: c }}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-xs text-primary/40">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-semibold text-primary">{formatPrice(product.price)}</span>
          {discount > 0 && (
            <span className="text-sm text-primary/40 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function PlaceholderArt({ gradient, name }) {
  const initial = (name || 'A').trim().charAt(0).toUpperCase();
  return (
    <div className={cn('flex h-full w-full items-center justify-center bg-gradient-to-br', gradient)}>
      <div className="text-center">
        <div className="font-serif text-6xl font-semibold text-white/15">{initial}</div>
        <div className="mt-1 text-[0.55rem] uppercase tracking-[0.4em] text-white/30">
          Amrooz
        </div>
      </div>
    </div>
  );
}
