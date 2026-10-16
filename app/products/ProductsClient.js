'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ProductGrid from '@/components/products/ProductGrid';
import { ChevronDownIcon, SearchIcon, CloseIcon } from '@/components/ui/Icons';
import { fetchProducts } from '@/lib/products';
import { cn } from '@/utils/format';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'women', label: "Women's" },
  { key: 'men', label: "Men's" },
  { key: 'accessories', label: 'Accessories' },
];

const SORTS = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name', label: 'Alphabetical' },
];

const HEADINGS = {
  all: { title: 'The Full Collection', text: 'Every piece, thoughtfully curated in one place.' },
  women: { title: "Women's Collection", text: 'Elevated essentials and statement pieces.' },
  men: { title: "Men's Collection", text: 'Modern tailoring and refined staples.' },
  accessories: { title: 'Accessories', text: 'The finishing touches that complete the look.' },
};

export default function ProductsClient({ initialCategory = 'all', initialSearch = '' }) {
  const router = useRouter();
  const startTab = TABS.some((t) => t.key === initialCategory) ? initialCategory : 'all';
  const [active, setActive] = useState(startTab);
  const [sort, setSort] = useState('featured');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Debounce the text field before it drives fetching/the URL, so real-time
  // typing doesn't hammer the API on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(handle);
  }, [search]);

  // Keep the URL in sync so the query is shareable/bookmarkable and
  // survives a refresh.
  useEffect(() => {
    const params = new URLSearchParams();
    if (active !== 'all') params.set('category', active);
    if (debouncedSearch) params.set('search', debouncedSearch);
    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : '/products', { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, debouncedSearch]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data } = await fetchProducts({
        category: active === 'all' ? undefined : active,
        search: debouncedSearch,
      });
      if (alive) {
        setProducts(data);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [active, debouncedSearch]);

  const sorted = useMemo(() => {
    const list = [...products];
    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => Number(a.price) - Number(b.price));
      case 'price-desc':
        return list.sort((a, b) => Number(b.price) - Number(a.price));
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [products, sort]);

  const heading = HEADINGS[active] || HEADINGS.all;
  const isSearching = debouncedSearch.length > 0;

  return (
    <>
      {/* Page banner */}
      <section className="border-b border-black/5 bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-14 text-center lg:px-8 lg:py-20">
          <nav className="mb-4 text-xs uppercase tracking-[0.25em] text-primary/40">
            Home <span className="mx-2">/</span>{' '}
            <span className="text-accent-dark">{isSearching ? 'Search' : 'Shop'}</span>
          </nav>
          {isSearching ? (
            <>
              <h1 className="font-serif text-4xl text-primary sm:text-5xl">
                Results for “{debouncedSearch}”
              </h1>
              <p className="mx-auto mt-4 max-w-md text-primary/60">
                {loading ? 'Searching…' : `${sorted.length} item${sorted.length === 1 ? '' : 's'} found.`}
              </p>
            </>
          ) : (
            <>
              <h1 className="font-serif text-4xl text-primary sm:text-5xl">{heading.title}</h1>
              <p className="mx-auto mt-4 max-w-md text-primary/60">{heading.text}</p>
            </>
          )}

          {/* Refine/clear search */}
          <div className="mx-auto mt-6 flex max-w-md items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 shadow-card">
            <SearchIcon className="h-4 w-4 shrink-0 text-primary/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search this collection…"
              className="w-full bg-transparent text-sm text-primary placeholder:text-primary/40 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="text-primary/40 hover:text-primary"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        {/* Toolbar */}
        <div className="mb-10 flex flex-col gap-5 border-b border-black/5 pb-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter tabs */}
          <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={cn(
                  'shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300',
                  active === tab.key
                    ? 'bg-primary text-white shadow-[0_10px_25px_-14px_rgba(20,17,13,0.7)]'
                    : 'bg-sand-100 text-primary/70 hover:bg-sand-200'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort + count */}
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="text-sm text-primary/50">
              {loading ? 'Loading…' : `${sorted.length} items`}
            </span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none rounded-full border border-black/10 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-primary focus:border-accent focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
            </div>
          </div>
        </div>

        <ProductGrid products={sorted} loading={loading} count={8} />
      </section>
    </>
  );
}
