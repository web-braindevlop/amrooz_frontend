import { notFound } from 'next/navigation';
import ProductDetail from '@/components/products/ProductDetail';
import RelatedProducts from '@/components/products/RelatedProducts';
import { fetchProduct, fetchProducts } from '@/lib/products';
import { htmlToPlainText } from '@/lib/richText';

// Next 15: dynamic route `params` is async and must be awaited.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: product } = await fetchProduct(id);

  if (!product) {
    return { title: 'Product Not Found — Amrooz Collection' };
  }

  const description =
    htmlToPlainText(product.shortDescription) ||
    htmlToPlainText(product.description) ||
    undefined;

  return {
    title: `${product.name} — Amrooz Collection`,
    description,
    openGraph: product.imageUrl
      ? { images: [{ url: product.imageUrl }] }
      : undefined,
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const { data: product } = await fetchProduct(id);

  if (!product) notFound();

  const { data: sameCategory } = await fetchProducts(product.category);
  const related = sameCategory
    .filter((p) => String(p.id) !== String(product.id))
    .slice(0, 4);

  return (
    <>
      <ProductDetail product={product} />
      <RelatedProducts products={related} />
    </>
  );
}
