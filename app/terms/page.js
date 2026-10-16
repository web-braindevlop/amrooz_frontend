export const metadata = {
  title: 'Terms & Conditions — Amrooz Collection',
  description: 'Terms of service for using our website.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
      <h1 className="font-serif text-4xl text-primary">Terms & Conditions</h1>
      <div className="prose prose-lg mt-8 text-primary/80">
        <p><strong>Last updated:</strong> October 2, 2026</p>
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using this website, you accept and agree to be bound by these terms.
        </p>
        <h2>Use of Site</h2>
        <p>
          You may use this site for lawful purposes only. You agree not to misuse the site or its content.
        </p>
        <h2>Product Information</h2>
        <p>
          We strive to provide accurate product information. However, we do not warrant that descriptions or other content is error-free.
        </p>
        <h2>Pricing</h2>
        <p>
          All prices are in Pakistani Rupees (PKR). We reserve the right to change prices without notice.
        </p>
      </div>
    </div>
  );
}
