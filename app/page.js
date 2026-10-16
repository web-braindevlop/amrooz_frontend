'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/home/Hero';
import FeatureBar from '@/components/home/FeatureBar';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import Testimonials from '@/components/home/Testimonials';
import ProductGrid from '@/components/products/ProductGrid';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { ArrowRightIcon, SparkleIcon } from '@/components/ui/Icons';
import { fetchProducts } from '@/lib/products';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await fetchProducts();
      if (active) {
        setProducts(data);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Hero />
      <FeatureBar />

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Handpicked for you"
          title="Featured pieces"
          description="A rotating edit of our most-loved styles this season."
          action={{ label: 'View all', href: '/products' }}
          align="left"
        />
        <div className="mt-12">
          <ProductGrid products={products.slice(0, 8)} loading={loading} count={8} />
        </div>
      </section>

      <CategoryShowcase />

      {/* Editorial promo banner */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-8 py-16 text-center sm:px-16 lg:py-24">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent-soft/10 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-accent">
              <SparkleIcon className="h-4 w-4" />
              Limited Time
            </span>
            <h2 className="mt-6 font-serif text-4xl text-white text-balance sm:text-5xl">
              The Season Edit — up to 30% off
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/60">
              Refresh your wardrobe with our curated seasonal selection. Elevated
              essentials, now at exceptional value.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button href="/products?sale=true" size="lg" variant="gold" iconRight={<ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />}>
                Shop the Sale
              </Button>
              <Button href="/products" size="lg" variant="ghostLight">
                Browse All
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />
    </>
  );
}
