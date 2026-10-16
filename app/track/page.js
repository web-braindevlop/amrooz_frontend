export const metadata = {
  title: 'Track Your Order — Amrooz Collection',
  description: 'Track your order status and delivery.',
};

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
      <h1 className="font-serif text-4xl text-primary">Track Your Order</h1>
      <div className="mt-8">
        <p className="text-primary/80">
          Enter your order number and email address to track your shipment.
        </p>
        <form className="mt-8 max-w-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary">Order Number</label>
            <input
              type="text"
              placeholder="e.g., A1B2C3D4E5F6"
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary">Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90"
          >
            Track Order
          </button>
        </form>
      </div>
    </div>
  );
}
