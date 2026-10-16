export const metadata = {
  title: 'Privacy Policy — Amrooz Collection',
  description: 'How we protect your privacy.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
      <h1 className="font-serif text-4xl text-primary">Privacy Policy</h1>
      <div className="prose prose-lg mt-8 text-primary/80">
        <p><strong>Last updated:</strong> October 2, 2026</p>
        <h2>Information We Collect</h2>
        <p>
          We collect information you provide when creating an account, placing an order, or contacting us.
        </p>
        <h2>How We Use Your Information</h2>
        <p>
          We use your information to process orders, improve our services, and communicate with you about your purchases.
        </p>
        <h2>Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information.
        </p>
        <h2>Contact</h2>
        <p>
          For privacy concerns, email privacy@amroozcollection.com
        </p>
      </div>
    </div>
  );
}
