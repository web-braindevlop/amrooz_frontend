import '@/app/globals.css';
import { Playfair_Display, Inter } from 'next/font/google';
import SiteChrome from '@/components/layout/SiteChrome';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Amrooz Collection — Premium Clothing & Fashion',
  description:
    'Discover premium, thoughtfully crafted clothing at Amrooz Collection. Timeless style, modern comfort.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
