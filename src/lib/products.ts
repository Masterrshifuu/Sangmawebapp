
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Product } from './types';

// This function is designed to run on the server
export async function getProducts(): Promise<{ products: Product[], error: string | null }> {
  try {
    const productsCollection = collection(db, 'products');
    const productsSnapshot = await getDocs(productsCollection);
    
    if (productsSnapshot.empty) {
      return { products: [], error: null };
    }

    const productsList = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));

    return { products: productsList, error: null };
  } catch (error: any) {
    console.error("Error fetching products from Firestore:", error);
    // Provide a more developer-friendly error message
    let errorMessage = `Firestore error: ${error.message}.`;
    if (error.code === 'permission-denied') {
        errorMessage += ' Please check your Firestore security rules. They might be too restrictive. For development, you can use rules that allow reads: "rules_version = \'2\'; service cloud.firestore { match /databases/{database}/documents { match /{document=**} { allow read; } } }"';
    } else if (error.code === 'unauthenticated') {
        errorMessage += ' The request was not authenticated. Make sure your server environment is configured with the correct Firebase credentials.';
    }
    return { products: [], error: errorMessage };
  }
}
