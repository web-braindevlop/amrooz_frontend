import SectionHeading from '@/components/ui/SectionHeading';
import ProductGrid from '@/components/products/ProductGrid';

/** "You may also like" strip shown at the bottom of a product detail page. */
export default function RelatedProducts({ products = [] }) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <SectionHeading
        eyebrow="Complete the look"
        title="You may also like"
        align="left"
      />
      <div className="mt-10">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
