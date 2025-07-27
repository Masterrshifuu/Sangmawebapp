
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, type Timestamp } from 'firebase/firestore';
import type { Product } from './types';

// Helper function to check if a value is a Firestore Timestamp
function isTimestamp(value: any): value is Timestamp {
    return value && typeof value.toDate === 'function';
}

function processDoc(doc: any) {
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
}

// This function is designed for one-time data fetching, primarily on the server
export async function getProducts(): Promise<{ products: Product[], error: string | null }> {
  try {
    const productsCollection = collection(db, 'products');
    const productsSnapshot = await getDocs(productsCollection);
    
    if (productsSnapshot.empty) {
      return { products: [], error: null };
    }

    const productsList = productsSnapshot.docs.map(processDoc);

    return { products: productsList, error: null };
  } catch (error: any) {
    console.error("Error fetching products from Firestore:", error);
    // Provide a more developer-friendly error message
    let errorMessage = `Firestore error: ${error.message}.`;
    if (error.code === 'permission-denied') {
        errorMessage += ' Please update your Firestore security rules in the Firebase console to allow read access. For development, you can use these rules: \n\n' +
        'rules_version = \'2\';\n' +
        'service cloud.firestore {\n' +
        '  match /databases/{database}/documents {\n' +
        '    // Allow anyone to read products and their reviews\n' +
        '    match /products/{productId} {\n' +
        '      allow read: if true;\n' +
        '      match /reviews/{reviewId} {\n' +
        '        allow read: if true;\n' +
        '      }\n' +
        '    }\n' +
        '    // Add other rules for collections like orders, userdata, etc. below\n' +
        '  }\n' +
        '}\n';
    } else if (error.code === 'unauthenticated') {
        errorMessage += ' The request was not authenticated. Make sure your server environment is configured with the correct Firebase credentials.';
    }
    return { products: [], error: errorMessage };
  }
}

export async function getProductById(id: string): Promise<{ product: Product | null, error: string | null }> {
    try {
        const productDocRef = doc(db, 'products', id);
        const productSnapshot = await getDoc(productDocRef);

        if (!productSnapshot.exists()) {
            return { product: null, error: 'Product not found.' };
        }
        
        const product = processDoc(productSnapshot);

        return { product, error: null };
    } catch (error: any) {
        console.error(`Error fetching product with ID ${id}:`, error);
        return { product: null, error: `Failed to fetch product: ${error.message}` };
    }
}
