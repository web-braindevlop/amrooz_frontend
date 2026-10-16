export const metadata = {
  title: 'Our Stores — Amrooz Collection',
  description: 'Visit us at our retail locations.',
};

export default function StoresPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
      <h1 className="font-serif text-4xl text-primary">Our Stores</h1>
      <div className="prose prose-lg mt-8 text-primary/80">
        <p>
          Experience Amrooz Collection in person at our flagship locations.
        </p>
        <h2>Karachi Flagship</h2>
        <p>Coming Soon</p>
        <h2>Lahore Store</h2>
        <p>Coming Soon</p>
        <p className="text-sm text-primary/60">
          Currently, we operate exclusively online. Follow us on social media for updates on our retail locations.
        </p>
      </div>
    </div>
  );
}
