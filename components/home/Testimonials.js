import SectionHeading from '@/components/ui/SectionHeading';
import { StarIcon } from '@/components/ui/Icons';

const REVIEWS = [
  {
    quote:
      'The quality is exceptional — the wool coat feels like something from a house twice the price. Impeccable tailoring.',
    name: 'Sarah M.',
    role: 'Verified Buyer',
    rating: 5,
  },
  {
    quote:
      'Fast shipping, beautiful packaging, and the fit is perfect. Amrooz has become my go-to for wardrobe staples.',
    name: 'Daniyal R.',
    role: 'Verified Buyer',
    rating: 5,
  },
  {
    quote:
      'Elegant, comfortable, and timeless. I get compliments every single time I wear the silk dress. Worth every penny.',
    name: 'Ayesha K.',
    role: 'Verified Buyer',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Loved worldwide"
          title="What our customers say"
          description="Join thousands who have made Amrooz Collection part of their everyday elegance."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure
              key={r.name}
              className="flex flex-col rounded-3xl bg-white p-8 shadow-card transition-transform duration-500 hover:-translate-y-1 hover:shadow-luxe"
            >
              <div className="flex text-accent">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4" style={{ fill: 'currentColor' }} strokeWidth={1} />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 font-serif text-lg leading-relaxed text-primary/85">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-black/5 pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-serif text-sm text-white">
                  {r.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-primary">{r.name}</p>
                  <p className="text-xs text-primary/50">{r.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
