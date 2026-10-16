'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { useCart } from '@/lib/cart/CartContext';
import {
  MinusIcon,
  PlusIcon,
  TrashIcon,
  CartIcon,
  ArrowRightIcon,
  TruckIcon,
  LockIcon,
} from '@/components/ui/Icons';
import { cn, formatPrice } from '@/utils/format';

const FLAT_SHIPPING = 250;

export default function CartClient() {
  const { items, subtotal, count, hydrated, updateQuantity, removeItem, clear } = useCart();
  const toast = useToast();

  const shipping = subtotal > 0 ? FLAT_SHIPPING : 0;
  const total = subtotal + shipping;

  // Until localStorage has been read, render a skeleton so a populated cart
  // doesn't flash "empty" for a frame on load.
  if (!hydrated) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="skeleton h-9 w-56 rounded" />
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-36 w-full rounded-3xl" />
            ))}
          </div>
          <div className="skeleton h-72 w-full rounded-3xl" />
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center lg:px-8">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sand-100 text-primary/50">
          <CartIcon className="h-9 w-9" />
        </span>
        <h1 className="mt-6 font-serif text-3xl text-primary">Your cart is empty</h1>
        <p className="mt-3 max-w-md text-sm text-primary/60">
          Looks like you haven&apos;t added anything yet. Explore the collection and find
          something you love.
        </p>
        <Button
          href="/products"
          size="lg"
          className="mt-8"
          iconRight={<ArrowRightIcon className="h-4 w-4" />}
        >
          Continue Shopping
        </Button>
      </section>
    );
  }



  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-accent-dark">Shopping Bag</p>
          <h1 className="mt-1 font-serif text-3xl text-primary sm:text-4xl">
            Your Cart
            <span className="ml-2 align-middle text-lg text-primary/40">
              ({count} {count === 1 ? 'item' : 'items'})
            </span>
          </h1>
        </div>
        <button
          type="button"
          onClick={clear}
          className="hidden text-sm font-medium text-primary/50 transition-colors hover:text-red-600 sm:inline"
        >
          Clear cart
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
        {/* Line items */}
        <ul className="divide-y divide-black/5 border-y border-black/5">
          {items.map((item) => (
            <CartLine
              key={item.key}
              item={item}
              onQty={(q) => updateQuantity(item.key, q)}
              onRemove={() => {
                removeItem(item.key);
                toast.success(`${item.name} removed from cart`);
              }}
            />
          ))}
        </ul>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-black/5 bg-sand-50 p-6">
            <h2 className="font-serif text-xl text-primary">Order Summary</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-primary/60">Subtotal</dt>
                <dd className="font-medium text-primary">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-primary/60">Shipping</dt>
                <dd className="font-medium text-primary">{formatPrice(shipping)}</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
              <span className="font-medium text-primary">Total</span>
              <span className="text-xl font-semibold text-primary">{formatPrice(total)}</span>
            </div>

            <Button
              href="/checkout"
              fullWidth
              size="lg"
              className="mt-6"
              iconLeft={<LockIcon className="h-4 w-4" />}
            >
              Proceed to Checkout
            </Button>
            <Link
              href="/products"
              className="mt-3 block text-center text-sm font-medium text-accent-dark hover:underline"
            >
              Continue shopping
            </Link>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-primary/45">
            <LockIcon className="h-3.5 w-3.5" /> Secure, encrypted checkout
          </p>
        </aside>
      </div>
    </section>
  );
}

function CartLine({ item, onQty, onRemove }) {
  const lineTotal = item.price * item.quantity;
  const atMax = item.maxStock ? item.quantity >= item.maxStock : false;

  return (
    <li className="flex gap-4 py-6">
      <Link
        href={`/products/${item.id}`}
        className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-sand-100 sm:h-32 sm:w-28"
        aria-label={item.name}
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-serif text-3xl text-primary/20">
            {(item.name || 'A').charAt(0)}
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-lg text-primary">
              <Link
                href={`/products/${item.id}`}
                className="transition-colors hover:text-accent-dark"
              >
                {item.name}
              </Link>
            </h3>
            {(item.size || item.colorHex) && (
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-primary/55">
                {item.size && (
                  <span>
                    Size: <span className="text-primary/80">{item.size}</span>
                  </span>
                )}
                {item.colorHex && (
                  <span className="inline-flex items-center gap-1.5">
                    Color:
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: item.colorHex }}
                    />
                    {item.colorName && <span className="text-primary/80">{item.colorName}</span>}
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name}`}
            className="shrink-0 text-primary/30 transition-colors hover:text-red-600"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="inline-flex items-center rounded-full border border-black/10">
            <button
              type="button"
              onClick={() => onQty(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex h-10 w-10 items-center justify-center text-primary/60 transition-colors hover:text-primary disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-primary">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQty(item.quantity + 1)}
              disabled={atMax}
              className="flex h-10 w-10 items-center justify-center text-primary/60 transition-colors hover:text-primary disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="text-right">
            <div className="font-semibold text-primary">{formatPrice(lineTotal)}</div>
            {item.quantity > 1 && (
              <div className="text-xs text-primary/45">{formatPrice(item.price)} each</div>
            )}
          </div>
        </div>

        {atMax && (
          <p className={cn('mt-1 text-right text-[0.7rem] text-accent-dark')}>
            Max available stock reached
          </p>
        )}
      </div>
    </li>
  );
}
