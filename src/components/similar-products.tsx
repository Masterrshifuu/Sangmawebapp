
import ProductCard from "@/components/product-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Product } from "@/lib/types";

type SimilarProductsProps = {
  products: Product[];
};

export default function SimilarProducts({ products }: SimilarProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold font-headline mb-6">Similar Products</h2>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-4 pb-4">
          {products.map((product) => (
            <div key={product.id} className="w-[200px] flex-shrink-0">
                <ProductCard product={product} size="small" />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
