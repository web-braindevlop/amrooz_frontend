export const metadata = {
  title: 'Our Story — Amrooz Collection',
  description: 'Learn about Amrooz Collection and our commitment to quality.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
      <h1 className="font-serif text-4xl text-primary">Our Story</h1>
      <div className="prose prose-lg mt-8 text-primary/80">
        <p>
          Amrooz Collection was founded with a simple belief: clothing should be both beautiful and enduring.
        </p>
        <p>
          We create thoughtfully designed pieces that transcend seasons and trends. Each garment is crafted with attention to detail, using quality materials that improve with age.
        </p>
        <h2>Our Philosophy</h2>
        <p>
          We believe in slow fashion — timeless design over fast trends, quality over quantity, and craftsmanship over mass production.
        </p>
        <h2>Our Commitment</h2>
        <p>
          Every piece in our collection is designed to be cherished for years. We work with skilled artisans and use sustainable practices wherever possible.
        </p>
      </div>
    </div>
  );
}
