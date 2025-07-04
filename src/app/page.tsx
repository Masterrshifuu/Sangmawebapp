
import { getProducts, getCategories } from "@/lib/data";
import CategoryCarousel from "@/components/category-carousel";
import ProductGrid from "@/components/product-grid";
import AuthWrapper from '@/components/auth/auth-wrapper';

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]).catch(err => {
    console.error("Failed to fetch initial data on server:", err);
    return [[], []]; // Return empty arrays on error
  });

  const bestsellers = products.filter((p) => p.bestseller);

  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-8">
        <CategoryCarousel categories={categories} products={products} />
        
        <ProductGrid title="Bestsellers" products={bestsellers} />

        {categories.map((category) => (
          <ProductGrid 
            key={category.id} 
            title={category.name} 
            products={products.filter((p) => p.category === category.name)} 
          />
        ))}
      </div>
    </AuthWrapper>
  );
}
