'use server';

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Product } from "@/lib/types";

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query) {
    return [];
  }
  
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(productsCol);
  const productList: Product[] = productSnapshot.docs.map(doc => {
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

  const lowerCaseQuery = query.toLowerCase();
  
  const filteredProducts = productList.filter(product => 
    product.name.toLowerCase().includes(lowerCaseQuery) ||
    product.category.toLowerCase().includes(lowerCaseQuery) ||
    product.description.toLowerCase().includes(lowerCaseQuery)
  );

  return filteredProducts;
}
