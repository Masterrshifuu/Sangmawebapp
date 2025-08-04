
import HomeContent from '@/components/pages/home/HomeContent';
import { ProductsProvider } from '@/hooks/use-products';
import { AdsProvider } from '@/hooks/use-ads';

export default function HomePage() {
  return (
      <AdsProvider>
        <HomeContent />
      </AdsProvider>
  );
}
