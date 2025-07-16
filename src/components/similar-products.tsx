import ProductCard from '@/components/product-card';
import type { Product } from '@/lib/types';

type SimilarProductsProps = {
  products: Product[];
};

export default function SimilarProducts({
  products,
}: SimilarProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold font-headline mb-6">Similar Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            size="small"
          />
        ))}
      </div>
    </section>
  );
}
