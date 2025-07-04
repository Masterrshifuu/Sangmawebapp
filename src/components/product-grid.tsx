import ProductCard from '@/components/product-card';
import type { Product } from '@/lib/types';

type ProductGridProps = {
  title: string;
  products: Product[];
  onProductClick: (product: Product) => void;
};

export default function ProductGrid({
  title,
  products,
  onProductClick,
}: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold font-headline mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            size="small"
            onProductClick={onProductClick}
          />
        ))}
      </div>
    </section>
  );
}
