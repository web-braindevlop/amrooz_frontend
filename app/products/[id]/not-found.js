import Button from '@/components/ui/Button';

export default function ProductNotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center lg:px-8">
      <p className="eyebrow text-accent-dark">404</p>
      <h1 className="mt-3 font-serif text-3xl text-primary sm:text-4xl">
        We couldn&apos;t find that product
      </h1>
      <p className="mt-4 text-primary/60">
        It may have sold out or been removed from the collection. Take a look at what&apos;s
        currently in store.
      </p>
      <Button href="/products" size="lg" className="mt-8">
        Browse the Collection
      </Button>
    </section>
  );
}
