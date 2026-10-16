export const metadata = {
  title: 'Returns & Exchanges — Amrooz Collection',
  description: 'Our hassle-free return and exchange policy.',
};

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
      <h1 className="font-serif text-4xl text-primary">Returns & Exchanges</h1>
      <div className="prose prose-lg mt-8 text-primary/80">
        <p>
          We want you to love your purchase. If you're not completely satisfied, we offer easy returns and exchanges.
        </p>
        <h2>30-Day Return Policy</h2>
        <p>
          Items can be returned within 30 days of delivery in their original condition with tags attached.
        </p>
        <h2>How to Return</h2>
        <ol>
          <li>Contact our customer service team</li>
          <li>Pack your items securely</li>
          <li>Ship to our returns address</li>
          <li>Receive your refund within 7-10 business days</li>
        </ol>
      </div>
    </div>
  );
}
