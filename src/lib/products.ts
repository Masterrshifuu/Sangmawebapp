
import { db } from './firebase';
import { collection, getDocs, type Timestamp } from 'firebase/firestore';
import type { Product } from './types';

// Helper function to check if a value is a Firestore Timestamp
function isTimestamp(value: any): value is Timestamp {
    return value && typeof value.toDate === 'function';
}

// This function is designed for one-time data fetching, primarily on the server
export async function getProducts(): Promise<{ products: Product[], error: string | null }> {
  try {
    const productsCollection = collection(db, 'products');
    const productsSnapshot = await getDocs(productsCollection);
    
    if (productsSnapshot.empty) {
      return { products: [], error: null };
    }

    const productsList = productsSnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert any Firestore Timestamps to serializable ISO strings
      for (const key in data) {
        if (isTimestamp(data[key])) {
          data[key] = data[key].toDate().toISOString();
        }
      }
      return {
        id: doc.id,
        ...data
      } as Product;
    });

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
