// This file is deprecated and will be removed.
// All data fetching should use src/lib/data-realtime.ts for real-time updates
// or a new file in src/lib for server-side static fetching if needed.

import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import type { Product, Category } from "@/lib/types";

// This function is kept for the AI flow but should be considered for replacement
// with a more optimized data source if performance becomes an issue.
export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, "products");
  const q = query(productsCol, orderBy("name"));
  const productSnapshot = await getDocs(q);
  const productList = productSnapshot.docs
    .map(doc => {
      const data = doc.data();
      const imageUrl = data.imageUrl || data.image || null;
      return {
        id: doc.id,
        name: data.name || "",
        description: data.description || "",
        price: (data.price && data.price > 0) ? data.price : (data.mrp || 0),
        imageUrl: typeof imageUrl === 'string' && imageUrl.trim() !== '' ? imageUrl : null,
        category: data.category || "",
        bestseller: data.isBestseller || data.bestseller || false,
      };
    })
    .filter(product => product.imageUrl !== null)
    .map(product => ({
      ...product,
      imageUrl: product.imageUrl as string, 
    }));
    
  return productList as Product[];
}

export async function getCategories(): Promise<Category[]> {
  const categoriesCol = collection(db, "categories");
  const q = query(categoriesCol, orderBy("name"));
  const categorySnapshot = await getDocs(q);
  const categoryList = categorySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "",
      subcategories: data.subcategories || [],
    };
  });
  return categoryList;
}
