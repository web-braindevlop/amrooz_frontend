export const metadata = {
  title: 'Sustainability — Amrooz Collection',
  description: 'Our commitment to sustainable and ethical fashion.',
};

export default function SustainabilityPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
      <h1 className="font-serif text-4xl text-primary">Sustainability</h1>
      <div className="prose prose-lg mt-8 text-primary/80">
        <p>
          At Amrooz Collection, we're committed to creating fashion that respects both people and the planet.
        </p>
        <h2>Our Practices</h2>
        <ul>
          <li>Using sustainable and organic materials wherever possible</li>
          <li>Working with ethical manufacturers</li>
          <li>Minimizing waste in our production process</li>
          <li>Creating timeless pieces that last for years</li>
        </ul>
        <h2>Looking Forward</h2>
        <p>
          We're continuously working to improve our practices and reduce our environmental impact. Sustainability is a journey, and we're committed to doing better every day.
        </p>
      </div>
    </div>
  );
}
