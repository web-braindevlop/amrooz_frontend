export const metadata = {
  title: 'Shipping & Delivery — Amrooz Collection',
  description: 'Learn about our shipping and delivery options.',
};

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
      <h1 className="font-serif text-4xl text-primary">Shipping & Delivery</h1>
      <div className="prose prose-lg mt-8 text-primary/80">
        <p>
          We offer fast and reliable shipping across Pakistan. Standard delivery charges Rs 250 for all orders.
        </p>
        <h2>Delivery Times</h2>
        <ul>
          <li>Karachi: 2-3 business days</li>
          <li>Lahore, Islamabad: 3-4 business days</li>
          <li>Other cities: 4-7 business days</li>
        </ul>
        <h2>Shipping Costs</h2>
        <p>Standard delivery: Rs 250 for all orders</p>
      </div>
    </div>
  );
}
