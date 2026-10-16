'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import { ArrowRightIcon, SparkleIcon, StarIcon } from '@/components/ui/Icons';
import { cn, formatPrice } from '@/utils/format';
import { sampleProducts } from '@/lib/sampleProducts';

const AUTOPLAY_MS = 6500;
const SLIDE_COUNT = 4;

// Featured product shown inside slide 1's visual card.
const HERO_FEATURE = sampleProducts[0];

const STATS = [
  { value: '12k+', label: 'Happy customers' },
  { value: '480+', label: 'Curated styles' },
  { value: '4.9', label: 'Average rating' },
];

const SLIDE_OUTER =
  'relative w-full shrink-0 snap-start overflow-hidden';
const SLIDE_INNER =
  'relative z-10 mx-auto flex min-h-[540px] w-full max-w-7xl items-center px-5 py-14 sm:min-h-[580px] lg:min-h-[640px] lg:px-8 lg:py-16';

export default function Hero() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  const goTo = useCallback((index) => {
    const el = trackRef.current;
    if (!el) return;
    const i = ((index % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  }, []);

  // Keep `active` in sync with the scroll position (native swipe / trackpad)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(el.scrollLeft / el.clientWidth);
        setActive((prev) => (prev === i ? prev : i));
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Autoplay — resets whenever the active slide or paused state changes
  useEffect(() => {
    if (paused || reduced) return undefined;
    const id = setTimeout(() => goTo(active + 1), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [active, paused, reduced, goTo]);

  // Respect users who prefer reduced motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(active - 1);
    }
  };

  return (
    <section
      className="relative bg-cream"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides track (natively scrollable + snapping) */}
      <div
        ref={trackRef}
        tabIndex={0}
        role="group"
        aria-label={`Slide ${active + 1} of ${SLIDE_COUNT}`}
        onKeyDown={onKeyDown}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        className="flex snap-x snap-mandatory overflow-x-auto outline-none hide-scrollbar"
      >
        <SlideEditorial active={active === 0} />
        <SlideCinematic active={active === 1} />
        <SlidePromo active={active === 2} />
        <SlideAccessories active={active === 3} />
      </div>

      {/* Arrow controls */}
      <button
        type="button"
        onClick={() => goTo(active - 1)}
        aria-label="Previous slide"
        className="group absolute left-3 top-[46%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary shadow-luxe backdrop-blur transition-all hover:bg-accent hover:text-primary sm:flex lg:left-5"
      >
        <ArrowRightIcon className="h-5 w-5 rotate-180 transition-transform group-hover:-translate-x-0.5" />
      </button>
      <button
        type="button"
        onClick={() => goTo(active + 1)}
        aria-label="Next slide"
        className="group absolute right-3 top-[46%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary shadow-luxe backdrop-blur transition-all hover:bg-accent hover:text-primary sm:flex lg:right-5"
      >
        <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Dots with autoplay progress */}
      <div className="absolute bottom-[104px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-luxe backdrop-blur lg:bottom-[116px]">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={active === i}
            className="relative h-1.5 overflow-hidden rounded-full transition-all duration-500"
            style={{ width: active === i ? 36 : 14 }}
          >
            <span className="absolute inset-0 rounded-full bg-primary/20" />
            {active === i && (
              <span
                className="absolute inset-y-0 left-0 w-full rounded-full bg-primary"
                style={{
                  transformOrigin: 'left',
                  transform: 'scaleX(0)',
                  animation: `progress ${AUTOPLAY_MS}ms linear forwards`,
                  animationPlayState: paused || reduced ? 'paused' : 'running',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Shared stat strip */}
      <div className="relative border-t border-black/5 bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-black/5 px-5 lg:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="py-6 text-center">
              <p className="font-serif text-3xl text-primary sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-[0.7rem] uppercase tracking-widest text-primary/50 sm:text-xs">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Slide 1 — Editorial split (cream, elegant)                                */
/* -------------------------------------------------------------------------- */
function SlideEditorial({ active }) {
  return (
    <div className={cn(SLIDE_OUTER, 'bg-cream')} aria-roledescription="slide" aria-label="New season collection">
      <div className={cn(SLIDE_INNER, 'grid items-center gap-10 lg:grid-cols-2')}>
        <div className={cn('transition-all duration-700', active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-white/60 px-4 py-1.5 text-xs font-semibold tracking-wide text-accent-dark backdrop-blur">
            <SparkleIcon className="h-4 w-4" />
            New Season 2026 Collection
          </span>
          <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-primary text-balance sm:text-6xl lg:text-7xl">
            Wear the art of
            <span className="block text-gold-gradient">effortless elegance</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-primary/60">
            Thoughtfully designed pieces crafted from considered materials — made to
            move with you, season after season.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="/products" size="lg" variant="primary" iconRight={<ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />}>
              Shop the Collection
            </Button>
            <Button href="/products?category=women" size="lg" variant="outline">
              Explore Women&apos;s
            </Button>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {['#8c2f39', '#2b3a4a', '#9c7c30', '#5b4a35'].map((c, i) => (
                <span key={i} className="h-10 w-10 rounded-full border-2 border-cream" style={{ backgroundColor: c }} />
              ))}
            </div>
            <div>
              <div className="flex text-accent">
                {[0, 1, 2, 3, 4].map((i) => (
                  <StarIcon key={i} className="h-4 w-4" style={{ fill: 'currentColor' }} strokeWidth={1} />
                ))}
              </div>
              <p className="mt-0.5 text-xs text-primary/60">
                Loved by <span className="font-semibold text-primary">12,000+</span> customers
              </p>
            </div>
          </div>
        </div>

        {/* Visual — now shown on mobile too */}
        <div className="relative">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[16rem] sm:max-w-xs lg:max-w-sm">
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#3a2a2f] via-[#241b20] to-[#17150f] shadow-luxe">
              <img
                src={HERO_FEATURE.imageUrl}
                alt={HERO_FEATURE.name}
                className="h-full w-full object-cover"
              />
              {/* Soft dark gradient for depth + wordmark legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
              <p className="absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.5em] text-white/70">
                Amrooz
              </p>
            </div>
            <div className="absolute left-1 top-6 flex animate-float items-center gap-3 rounded-2xl bg-white/95 p-2.5 shadow-luxe backdrop-blur sm:-left-6 sm:top-10 sm:p-3">
              <img
                src={sampleProducts[0].imageUrl}
                alt={sampleProducts[0].name}
                className="h-14 w-12 shrink-0 rounded-xl object-cover sm:h-16 sm:w-14"
              />
              <div className="pr-1">
                <p className="text-[0.6rem] uppercase tracking-widest text-primary/50">Featured</p>
                <p className="mt-1 font-serif text-sm text-primary">Silk Evening Dress</p>
                <p className="mt-0.5 text-sm font-semibold text-accent-dark">Rs 1500</p>
              </div>
            </div>
            <div className="absolute -bottom-4 right-1 flex items-center gap-3 rounded-2xl bg-primary p-3 text-white shadow-luxe sm:-bottom-5 sm:right-0 sm:p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-primary">
                <SparkleIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Fast Delivery</p>
                <p className="text-[0.7rem] text-white/60">Delivery charges Rs 250</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Slide 2 — Cinematic full-bleed portrait (dark photo backdrop)             */
/* -------------------------------------------------------------------------- */
const CINEMATIC_FEATURE = sampleProducts[1]; // Tailored Wool Overcoat

function SlideCinematic({ active }) {
  return (
    <div className={cn(SLIDE_OUTER, 'bg-primary')} aria-roledescription="slide" aria-label="The Winter Atelier">
      {/* Full-bleed backdrop photo — object-cover fills the slide at every
          breakpoint, so the crop stays correct from phone to ultrawide. */}
      <div className="absolute inset-0">
        <img
          src={CINEMATIC_FEATURE.imageUrl}
          alt=""
          aria-hidden="true"
          className={cn(
            'h-full w-full object-cover transition-transform duration-[2500ms] ease-out',
            active ? 'scale-100' : 'scale-110',
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent" />
      </div>

      {/* Thin frame lines for the "atelier" feel */}
      <div className="pointer-events-none absolute inset-x-5 top-8 hidden h-px bg-white/15 sm:block lg:inset-x-8" />
      <div className="pointer-events-none absolute inset-x-5 bottom-8 hidden h-px bg-white/15 sm:block lg:inset-x-8" />

      {/* Vertical side label */}
      <span className="absolute left-6 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[0.65rem] uppercase tracking-[0.5em] text-white/45 lg:block">
        Est. 2026 — Amrooz
      </span>

      <div className={SLIDE_INNER}>
        <div className={cn('max-w-xl transition-all duration-700', active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
            <SparkleIcon className="h-4 w-4 text-accent" />
            The Winter Atelier
          </span>
          <h2 className="mt-6 font-serif text-5xl leading-[1.05] text-white text-balance sm:text-6xl lg:text-7xl">
            Crafted to keep
            <span className="mt-1 block text-gold-gradient">you timeless</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/70">
            Considered outerwear in double-faced Italian wool and pure cashmere —
            structured, warm, and made to outlast the season.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="/products?category=men" size="lg" variant="gold" iconRight={<ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />}>
              Discover Outerwear
            </Button>
            <Button href="/products" size="lg" variant="ghostLight" className="border border-white/30 hover:border-white/50">
              View Lookbook
            </Button>
          </div>

          {/* Material chip — echoes the small floating badges on the other slides */}
          <div className="mt-8 inline-flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-2.5 text-xs text-white/80 backdrop-blur">
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
            100% Italian wool · Cashmere lined
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Slide 3 — Promo / product collage (warm, asymmetric)                      */
/* -------------------------------------------------------------------------- */
const COLLAGE = [
  {
    label: 'Evening Dress',
    price: 'Rs 18,900',
    was: 'Rs 27,000',
    discount: 30,
    imageUrl: sampleProducts[0].imageUrl,
  },
  {
    label: 'Wool Overcoat',
    price: 'Rs 32,900',
    was: 'Rs 41,000',
    discount: 20,
    imageUrl: sampleProducts[1].imageUrl,
  },
  {
    label: 'Leather Tote',
    price: 'Rs 25,900',
    was: 'Rs 32,400',
    discount: 20,
    imageUrl: sampleProducts[5].imageUrl,
  },
];

function SlidePromo({ active }) {
  const [feature, ...rest] = COLLAGE;
  return (
    <div
      className={cn(SLIDE_OUTER, 'bg-cream')}
      aria-roledescription="slide"
      aria-label="Season sale"
    >
      <div className={cn(SLIDE_INNER, 'grid items-center gap-8 lg:grid-cols-2 lg:gap-10')}>
        {/* Offer copy */}
        <div className={cn('transition-all duration-700', active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4')}>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <SparkleIcon className="h-4 w-4" />
            Season Sale
          </span>
          <h2 className="mt-6 font-serif text-5xl leading-[1.05] text-primary text-balance sm:text-6xl lg:text-7xl">
            Up to <span className="text-gold-gradient">30% off</span>
            <span className="block">the new edit</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-primary/60">
            A curated selection of seasonal favourites at exceptional value.
            Limited quantities — once they&apos;re gone, they&apos;re gone.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="/products?sale=true" size="lg" variant="gold" iconRight={<ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />}>
              Shop the Sale
            </Button>
            <Button href="/products" size="lg" variant="outline">
              Browse All
            </Button>
          </div>
        </div>

        {/* Product grid — fluid flex/percentage layout, no fixed pixel
            offsets, so it can never overflow a narrow viewport the way an
            absolutely-positioned collage can. */}
        <div className="flex h-64 gap-3 sm:h-80 sm:gap-4 lg:h-[26rem]">
          <SaleTile tile={feature} active={active} delay={0} className="w-1/2" big />
          <div className="flex w-1/2 flex-col gap-3 sm:gap-4">
            {rest.map((tile, i) => (
              <SaleTile
                key={tile.label}
                tile={tile}
                active={active}
                delay={(i + 1) * 120}
                className="flex-1"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SaleTile({ tile, active, delay, className, big }) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl shadow-luxe transition-all duration-700',
        className,
        active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
      )}
      style={{ transitionDelay: `${active ? delay : 0}ms` }}
    >
      <img
        src={tile.imageUrl}
        alt={tile.label}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <span className="absolute left-2.5 top-2.5 rounded-full bg-accent px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-widest text-primary sm:left-3 sm:top-3">
        -{tile.discount}%
      </span>
      <div className="absolute inset-x-2.5 bottom-2.5 text-white sm:inset-x-3 sm:bottom-3">
        <p className="truncate text-[0.65rem] uppercase tracking-widest text-white/70">
          {tile.label}
        </p>
        <div className="mt-1 flex items-baseline gap-1.5 sm:gap-2">
          <p className={cn('font-serif font-semibold', big ? 'text-lg sm:text-2xl' : 'text-sm sm:text-lg')}>
            {tile.price}
          </p>
          <p className="text-[0.65rem] text-white/50 line-through sm:text-xs">{tile.was}</p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Slide 4 — Accessories edit (reversed split, staggered product pair)       */
/* -------------------------------------------------------------------------- */
const ACCESSORIES = sampleProducts
  .filter((p) => p.category === 'accessories')
  .slice(0, 2);

function SlideAccessories({ active }) {
  return (
    <div
      className={cn(SLIDE_OUTER, 'bg-cream')}
      aria-roledescription="slide"
      aria-label="The accessories edit"
    >
      {/* Soft gold halo behind the product pair */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className={cn(SLIDE_INNER, 'grid items-center gap-10 lg:grid-cols-2')}>
        {/* Visual — staggered pair, same style on every screen size */}
        <div className="relative order-2 h-72 sm:h-80 lg:order-1 lg:h-96">
          {ACCESSORIES.map((product, i) => (
            <div
              key={product.id}
              className={cn(
                'group absolute overflow-hidden rounded-[1.75rem] shadow-luxe transition-all duration-700',
                i === 0
                  ? 'left-2 top-0 h-60 w-44 sm:h-72 sm:w-52 lg:h-80 lg:w-60'
                  : 'bottom-0 right-4 h-48 w-36 sm:right-6 sm:h-60 sm:w-44 lg:h-64 lg:w-52',
                active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{ transitionDelay: `${active ? i * 140 : 0}ms` }}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 text-white">
                <p className="text-[0.7rem] uppercase tracking-widest text-white/60">
                  {product.name}
                </p>
                <p className="mt-1 font-serif text-lg font-semibold">
                  {formatPrice(product.price)}
                </p>
              </div>
              {product.isNew && (
                <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-widest text-primary">
                  New
                </span>
              )}
            </div>
          ))}

          {/* Floating rating chip */}
          <div
            className={cn(
              'absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/95 px-5 py-3 text-center shadow-luxe backdrop-blur transition-all duration-700',
              active ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            )}
            style={{ transitionDelay: `${active ? 320 : 0}ms` }}
          >
            <div className="flex justify-center text-accent">
              {[0, 1, 2, 3, 4].map((i) => (
                <StarIcon key={i} className="h-3.5 w-3.5" style={{ fill: 'currentColor' }} strokeWidth={1} />
              ))}
            </div>
            <p className="mt-1 text-[0.65rem] uppercase tracking-widest text-primary/50">
              Top rated edit
            </p>
          </div>
        </div>

        {/* Copy */}
        <div
          className={cn(
            'order-1 transition-all duration-700 lg:order-2',
            active ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          )}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark backdrop-blur">
            <SparkleIcon className="h-4 w-4" />
            The Accessories Edit
          </span>
          <h2 className="mt-6 font-serif text-5xl leading-[1.05] text-primary text-balance sm:text-6xl lg:text-7xl">
            Details that
            <span className="block text-gold-gradient">finish the look</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-primary/60">
            Full-grain leather, considered hardware and 14k gold-plated finishes —
            the small pieces that carry a whole wardrobe.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              href="/products?category=accessories"
              size="lg"
              variant="primary"
              iconRight={<ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            >
              Shop Accessories
            </Button>
            <Button href="/products" size="lg" variant="outline">
              Browse All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
