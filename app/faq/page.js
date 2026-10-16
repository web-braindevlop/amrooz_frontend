export const metadata = {
  title: 'FAQ — Amrooz Collection',
  description: 'Frequently asked questions.',
};

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
      <h1 className="font-serif text-4xl text-primary">Frequently Asked Questions</h1>
      <div className="mt-8 space-y-8">
        <div>
          <h3 className="font-serif text-xl text-primary">How long does shipping take?</h3>
          <p className="mt-2 text-primary/80">
            Delivery typically takes 2-7 business days depending on your location in Pakistan.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-xl text-primary">Do you offer international shipping?</h3>
          <p className="mt-2 text-primary/80">
            Currently, we only ship within Pakistan.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-xl text-primary">What is your return policy?</h3>
          <p className="mt-2 text-primary/80">
            We offer 30-day returns on unworn items with tags attached. See our Returns page for details.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-xl text-primary">How do I track my order?</h3>
          <p className="mt-2 text-primary/80">
            Use our Track Your Order page with your order number and email address.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-xl text-primary">What payment methods do you accept?</h3>
          <p className="mt-2 text-primary/80">
            We accept credit/debit cards, mobile wallets, and cash on delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
