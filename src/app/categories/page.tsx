import { getCategories, getProducts } from "@/lib/data";
import CategoryList from "@/components/category-list";
import type { Metadata } from 'next';
import AuthWrapper from "@/components/auth/auth-wrapper";
import type { Product } from "@/lib/types";

export const metadata: Metadata = {
  title: 'All Categories - Sangma Megha Mart',
  description: 'Browse all product categories and subcategories.',
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const products: Product[] = await getProducts();

  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-headline mb-8">All Categories</h1>
        <CategoryList categories={categories} products={products} />
      </div>
    </AuthWrapper>
  );
}
