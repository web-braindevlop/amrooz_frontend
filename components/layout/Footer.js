import Link from 'next/link';
import NewsletterForm from '@/components/layout/NewsletterForm';
import {
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  PinterestIcon,
} from '@/components/ui/Icons';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'New Arrivals', href: '/products' },
      { label: "Women's", href: '/products?category=women' },
      { label: "Men's", href: '/products?category=men' },
      { label: 'Accessories', href: '/products?category=accessories' },
      { label: 'Sale', href: '/products?sale=true' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Shipping & Delivery', href: '/shipping' },
      { label: 'Returns & Exchanges', href: '/returns' },
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'Track Your Order', href: '/track' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'House of Amrooz',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Sustainability', href: '/sustainability' },
      { label: 'Careers', href: '/careers' },
      { label: 'Stores', href: '/stores' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
  { label: 'Facebook', href: 'https://facebook.com', Icon: FacebookIcon },
  { label: 'Twitter', href: 'https://twitter.com', Icon: TwitterIcon },
  { label: 'Pinterest', href: 'https://pinterest.com', Icon: PinterestIcon },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-white/70">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="eyebrow text-accent">Stay in the loop</p>
            <h3 className="mt-3 font-serif text-3xl text-white sm:text-4xl">
              Join the Amrooz inner circle
            </h3>
            <p className="mt-3 max-w-md text-sm text-white/60">
              Early access to new drops, private sales, and styling notes — straight to your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main columns */}
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex flex-col leading-none">
              <span className="font-serif text-2xl font-semibold text-white">Amrooz</span>
              <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.45em] text-accent">
                Collection
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
              Thoughtfully crafted clothing for the modern wardrobe. Timeless design,
              considered materials, made to last.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all hover:border-accent hover:bg-accent hover:text-primary"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-serif text-base text-white">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/55 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-xs text-white/45 sm:flex-row lg:px-8">
          <p>&copy; {new Date().getFullYear()} Amrooz Collection. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-white/80">Privacy</Link>
            <Link href="/terms" className="hover:text-white/80">Terms</Link>
            <div className="flex items-center gap-1.5 opacity-80">
              {['VISA', 'MC', 'AMEX', 'PayPal'].map((p) => (
                <span
                  key={p}
                  className="rounded bg-white/10 px-2 py-1 text-[0.6rem] font-semibold tracking-wide text-white/70"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
