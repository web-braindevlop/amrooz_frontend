import Link from 'next/link';
import SectionHeading from '@/components/ui/SectionHeading';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { sampleCategories } from '@/lib/sampleProducts';

/**
 * "Shop by category" grid. The first card spans two columns on large
 * screens for an editorial, asymmetric layout.
 */
export default function CategoryShowcase({ categories = sampleCategories }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Curated edits"
        title="Shop by category"
        description="From elevated everyday staples to statement pieces — find your next favourite."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => (
          <Link
            key={cat.key}
            href={`/products?category=${cat.key}`}
            className={`group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-3xl shadow-card transition-shadow duration-500 hover:shadow-luxe ${
              i === 0 ? 'lg:col-span-2 lg:min-h-[420px]' : ''
            }`}
          >
            {/* Background Image with Zoom Effect */}
            <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div style={{ background: cat.accent }} className="h-full w-full" />
              )}
            </div>

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Decorative Monogram */}
            <span className="absolute -right-6 -top-10 select-none font-serif text-[12rem] leading-none text-white/10 transition-all duration-500 group-hover:text-white/15">
              {cat.title.charAt(0)}
            </span>

            {/* Content */}
            <div className="relative z-10 p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-white/80">{cat.tagline}</p>
              <h3 className="mt-2 font-serif text-3xl font-semibold text-white lg:text-4xl">{cat.title}</h3>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white transition-all group-hover:gap-3">
                Shop now
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
