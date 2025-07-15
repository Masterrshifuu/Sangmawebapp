import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Product, Category } from "@/lib/types";

export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(productsCol);
  const productList = productSnapshot.docs
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        description: data.description || "",
        price: (data.price && data.price > 0) ? data.price : (data.mrp || 0),
        imageUrl: data.imageUrl || data.image || null, // Set to null if no image
        category: data.category || "",
        bestseller: data.isBestseller || data.bestseller || false,
      };
    })
    .filter(product => product.imageUrl !== null) // Filter out products without an image
    .map(product => ({
      ...product,
      imageUrl: product.imageUrl || "https://placehold.co/300x300.png", // Assign placeholder to satisfy type, though it should not be null here
    }));
    
  return productList as Product[];
}

export async function getCategories(): Promise<Category[]> {
  const categoriesCol = collection(db, "categories");
  const categorySnapshot = await getDocs(categoriesCol);
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
