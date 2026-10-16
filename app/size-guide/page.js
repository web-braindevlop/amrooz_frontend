export const metadata = {
  title: 'Size Guide — Amrooz Collection',
  description: 'Find your perfect fit with our comprehensive size guide.',
};

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
      <h1 className="font-serif text-4xl text-primary">Size Guide</h1>
      <div className="prose prose-lg mt-8 text-primary/80">
        <p>
          Find your perfect fit with our detailed sizing charts. All measurements are in inches.
        </p>
        <h2>How to Measure</h2>
        <ul>
          <li><strong>Chest:</strong> Measure around the fullest part of your chest</li>
          <li><strong>Waist:</strong> Measure around your natural waistline</li>
          <li><strong>Hips:</strong> Measure around the fullest part of your hips</li>
        </ul>
        <h2>Women's Sizing</h2>
        <p>XS (32-34) | S (34-36) | M (36-38) | L (38-40) | XL (40-42)</p>
        <h2>Men's Sizing</h2>
        <p>S (36-38) | M (38-40) | L (40-42) | XL (42-44) | XXL (44-46)</p>
      </div>
    </div>
  );
}
