import ProductCard from '@/components/products/ProductCard';
import { cn } from '@/utils/format';

/**
 * Responsive product grid with built-in loading skeletons and empty state.
 * `products` is an array; `loading` toggles skeletons; `count` controls
 * skeleton quantity.
 */
export default function ProductGrid({
  products = [],
  loading = false,
  count = 8,
  className,
}) {
  const gridClass = cn(
    'grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4',
    className
  );

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return <EmptyState />;
  }

  return (
    <div className={gridClass}>
      {products.map((product, i) => (
        <div
          key={product.id}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
        >
          <ProductCard product={product} priority={i < 4} />
        </div>
      ))}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="skeleton aspect-[3/4] w-full rounded-2xl" />
      <div className="space-y-2 px-1 pt-4">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/4 rounded" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 bg-sand-50 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-card">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-primary/40" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 4h2l1.6 11.2a2 2 0 0 0 2 1.8h7.9a2 2 0 0 0 2-1.6L20 8H6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9.5" cy="20" r="1.2" />
          <circle cx="17" cy="20" r="1.2" />
        </svg>
      </div>
      <h3 className="mt-5 font-serif text-xl text-primary">No products here yet</h3>
      <p className="mt-2 max-w-sm text-sm text-primary/55">
        We&apos;re curating this collection. Start the backend or check back soon for new arrivals.
      </p>
    </div>
  );
}
