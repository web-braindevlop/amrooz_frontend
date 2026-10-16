import ProductsClient from './ProductsClient';

export const metadata = {
  title: 'Shop — Amrooz Collection',
  description: 'Browse the full Amrooz Collection: women’s, men’s and accessories.',
};

// Next 15: `searchParams` is async and must be awaited.
export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;
  const category = typeof sp?.category === 'string' ? sp.category : 'all';
  const search = typeof sp?.search === 'string' ? sp.search : '';

  // `key` remounts the client view when the URL category/search changes
  // (e.g. navigating from the navbar links or the search dropdown).
  return (
    <ProductsClient
      key={`${category}:${search}`}
      initialCategory={category}
      initialSearch={search}
    />
  );
}
