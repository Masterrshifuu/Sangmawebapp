import ProductCard from "@/components/product-card";
import type { Product } from "@/lib/types";

type ProductGridProps = {
  title: string;
  products: Product[];
};

export default function ProductGrid({ title, products }: ProductGridProps) {
    if (products.length === 0) {
        return null;
    }
    
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold font-headline mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
