
import HomeContent from '@/components/pages/home/HomeContent';
import { ProductsProvider } from '@/hooks/use-products';

export default function HomePage() {
  return (
    <ProductsProvider>
        <HomeContent />
    </ProductsProvider>
  );
}
