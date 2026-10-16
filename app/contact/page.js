export const metadata = {
  title: 'Contact Us — Amrooz Collection',
  description: 'Get in touch with our team.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
      <h1 className="font-serif text-4xl text-primary">Contact Us</h1>
      <div className="prose prose-lg mt-8 text-primary/80">
        <p>
          Have questions? We'd love to hear from you.
        </p>
        <h2>Customer Service</h2>
        <p>Email: support@amroozcollection.com</p>
        <p>Phone: +92 300 1234567</p>
        <p>Hours: Mon-Sat, 9:00 AM - 6:00 PM PKT</p>
        <h2>Business Inquiries</h2>
        <p>Email: info@amroozcollection.com</p>
      </div>
    </div>
  );
}
