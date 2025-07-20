'use client';

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import type { Product, Category } from "@/lib/types";

// Note: These functions are intended for client-side use only.

/**
 * Listens for real-time updates to the products collection.
 * @param callback - A function to be called with the updated products list.
 * @returns An unsubscribe function to stop listening for updates.
 */
export function listenToProducts(callback: (products: Product[]) => void): () => void {
  const productsCol = collection(db, "products");
  const q = query(productsCol, orderBy("name")); // It's good practice to order results

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const productList = snapshot.docs
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

    callback(productList as Product[]);
  }, (error) => {
    console.error("Error listening to products collection:", error);
    // You might want to handle this error in your UI, e.g., show a toast message
  });

  return unsubscribe;
}

/**
 * Listens for real-time updates to the categories collection.
 * @param callback - A function to be called with the updated categories list.
 * @returns An unsubscribe function to stop listening for updates.
 */
export function listenToCategories(callback: (categories: Category[]) => void): () => void {
  const categoriesCol = collection(db, "categories");
  const q = query(categoriesCol, orderBy("name"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const categoryList = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        subcategories: data.subcategories || [],
      };
    });
    callback(categoryList);
  }, (error) => {
    console.error("Error listening to categories collection:", error);
  });

  return unsubscribe;
}
