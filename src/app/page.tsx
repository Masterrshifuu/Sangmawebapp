import Image from "next/image";
import { categories, products } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ProductCard from "@/components/product-card";

export default function Home() {
  const bestsellers = products.filter((p) => p.bestseller);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h2 className="text-3xl font-bold font-headline mb-6">Categories</h2>
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex w-max space-x-4 pb-4">
            {categories.map((category) => (
              <Card key={category.name} className="flex-shrink-0 w-[150px] h-[150px] flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-16 h-16 mb-2" data-ai-hint="grocery category">
                  <Image
                    src={`https://placehold.co/64x64.png`}
                    alt={category.name}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <span className="font-semibold text-center">{category.name}</span>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold font-headline mb-6">Bestsellers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {categories.map((category) => (
        <section key={category.name} className="mb-12">
          <h2 className="text-3xl font-bold font-headline mb-6">{category.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products
              .filter((p) => p.category === category.name)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
