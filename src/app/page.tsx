import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Product, Category } from "@/lib/types";
import CategoryCarousel from "@/components/category-carousel";
import ProductGrid from "@/components/product-grid";

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
