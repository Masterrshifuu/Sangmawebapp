
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, type Timestamp, query, where } from 'firebase/firestore';
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
    // Query to fetch only products with stock greater than 0
    const q = query(productsCollection, where('stock', '>', 0));
    const productsSnapshot = await getDocs(q);
    
    if (productsSnapshot.empty) {
      return { products: [], error: null };
    }

    const productsList = productsSnapshot.docs.map(processDoc);

    return { products: productsList, error: null };
  } catch (error: any) {
    console.error("Error fetching products from Firestore:", error);
    
    // During build time, Firebase operations will fail - return empty data
    if (error.message && error.message.includes('Firebase') && error.message.includes('not available')) {
      return { products: [], error: null };
    }
    
    // Provide a more developer-friendly error message
    let errorMessage = `Firestore error: ${error.message}.`;
    if (error.code === 'permission-denied') {
        errorMessage = 'Your Firestore security rules are blocking access to the product data. This is a common setup step for new Firebase projects.\n\n' +
        'To fix this, go to the Firestore Database section of your Firebase console, click on the "Rules" tab, and replace the existing rules with the following code. This will allow public read access for your catalog while securing user and order data.\n\n\n' +
        '// Recommended Firestore Security Rules for Sangma Megha Mart\n' +
        'rules_version = \'2\';\n' +
        'service cloud.firestore {\n' +
        '  match /databases/{database}/documents {\n\n' +
        '    // Products and their reviews should be publicly readable\n' +
        '    match /products/{productId} {\n' +
        '      allow read: if true;\n' +
        '      allow update: if request.auth != null; // For updating ratings\n' +
        '      match /reviews/{reviewId} {\n' +
        '        allow read: if true;\n' +
        '        allow create: if request.auth != null; // Only logged-in users can write reviews\n' +
        '      }\n' +
        '    }\n\n' +
        '    // Ads should be publicly readable\n' +
        '    match /ads/{adId} {\n' +
        '      allow read: if true;\n' +
        '    }\n\n' +
        '    // Userdata can only be read/written by the authenticated user themselves\n' +
        '    match /userdata/{userId} {\n' +
        '       allow read, write: if request.auth != null && request.auth.uid == userId;\n' +
        '    }\n\n' +
        '    // Orders can be created by any authenticated user, but only read/updated by the user who owns it\n' +
        '    match /orders/{orderId} {\n' +
        '       allow create: if request.auth != null;\n' +
        '       allow read, update: if request.auth != null && resource.data.userId == request.auth.uid;\n' +
        '    }\n\n' +
        '    // Internal counters for things like order numbers\n' +
        '    match /counters/{counterId} {\n' +
        '       allow read, write: if request.auth != null; // Can be restricted further if needed\n' +
        '    }\n' +
        '  }\n' +
        '}\n';
    } else if (error.code === 'unauthenticated') {
        errorMessage += ' The request was not authenticated. Make sure your server environment is configured with the correct Firebase credentials.';
    } else if (error.code === 'failed-precondition') {
        errorMessage += ' The query requires an index. You can create it here: ' + (error.message.match(/https?:\/\/[^\s]+/)?.[0] || 'Check the Firebase console logs for the link.');
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
        
        // During build time, return null product
        if (error.message && error.message.includes('Firebase') && error.message.includes('not available')) {
            return { product: null, error: null };
        }
        
        return { product: null, error: `Failed to fetch product: ${error.message}` };
    }
}
