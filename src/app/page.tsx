
import { Metadata } from 'next';
import HomeContent from '@/components/pages/home/HomeContent';
import { ProductsProvider } from '@/hooks/use-products';

export const metadata: Metadata = {
  title: 'Sangma Megha Mart - Grocery & Essentials in Tura',
  description: 'Buy groceries, snacks, and household items from Sangma Megha Mart — fast delivery across Tura. Trusted local mart.',
  keywords: ['Sangma Megha Mart', 'Sangma Mart', 'Mart Sangma', 'Grocery Tura', 'Tura grocery', 'online shopping', 'snacks', 'daily needs', 'north tura', 'south tura'],
  openGraph: {
    title: 'Sangma Megha Mart - Tura’s Trusted Grocery Store',
    description: 'Fast 35-minute delivery in South/North Tura & NEHU area. Shop fresh essentials today!',
    url: 'https://sangmameghamart.com',
    siteName: 'Sangma Megha Mart',
    images: [
      {
        url: 'https://sangmameghamart.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sangma Megha Mart Home Banner',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sangma Megha Mart',
    description: 'Groceries and essentials delivered fast in Tura. Powered by Sangma Megha Mart.',
    images: ['https://sangmameghamart.com/og-image.jpg'],
  },
};

export default function HomePage() {
  return (
    <ProductsProvider>
        <HomeContent />
    </ProductsProvider>
  );
}
