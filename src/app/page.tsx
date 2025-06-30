import { getProducts, getCategories } from "@/lib/data";
import type { Product, Category } from "@/lib/types";
import CategoryCarousel from "@/components/category-carousel";
import ProductGrid from "@/components/product-grid";

export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories();

  const bestsellers = products.filter((p) => p.bestseller);

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryCarousel categories={categories} />
      
      <ProductGrid title="Bestsellers" products={bestsellers} />

      {categories.map((category) => (
        <ProductGrid 
          key={category.id} 
          title={category.name} 
          products={products.filter((p) => p.category === category.name)} 
        />
      ))}
    </div>
  );
}
