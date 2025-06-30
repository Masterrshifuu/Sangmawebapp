import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ProductCard from "@/components/product-card";
import type { Product, Category } from "@/lib/types";

async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(productsCol);
  const productList = productSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "",
      description: data.description || "",
      price: data.mrp || 0,
      imageUrl: data.image || "https://placehold.co/300x300.png",
      category: data.category || "",
      bestseller: data.bestseller || false,
    };
  });
  return productList;
}

async function getCategories(): Promise<Category[]> {
  const categoriesCol = collection(db, "categories");
  const categorySnapshot = await getDocs(categoriesCol);
  const categoryList = categorySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "",
    };
  });
  return categoryList;
}

export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories();

  const bestsellers = products.filter((p) => p.bestseller);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h2 className="text-3xl font-bold font-headline mb-6">Categories</h2>
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex w-max space-x-4 pb-4">
            {categories.map((category) => (
              <Card key={category.id} className="flex-shrink-0 w-[150px] h-[150px] flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow cursor-pointer">
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

      {bestsellers.length > 0 && (
      <section className="mb-12">
        <h2 className="text-3xl font-bold font-headline mb-6">Bestsellers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      )}

      {categories.map((category) => (
        <section key={category.id} className="mb-12">
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
