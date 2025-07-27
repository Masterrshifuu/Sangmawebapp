
"use server";

import { chatShopping, ChatShoppingOutput } from "@/ai/flows/chat-shopping";
import { itemRecommendation } from "@/ai/flows/item-recommendation";
import { getProducts, getProductById } from "@/lib/products";
import type { Product, AIState, UserData } from "@/lib/types";
import { getUserData } from "@/lib/user";
import { auth, db } from "@/lib/firebase";
import Fuse from 'fuse.js';
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";


// This is a new type to handle the optional product context in chat history
type ChatMessage = AIState[number] & {
    productContext?: { name: string; description: string };
};

async function findMatchingProducts(description: string): Promise<Product[]> {
    const { products: allProducts, error } = await getProducts();
    if (error || allProducts.length === 0) {
        return [];
    }
  
    const fuse = new Fuse(allProducts, {
      keys: ['name', 'description', 'category', 'tags'],
      threshold: 0.4, // Adjust for more or less strict matching
      includeScore: true,
    });
  
    const results = fuse.search(description);
  
    // Return top 3 matches with a score below a certain threshold (e.g., 0.5)
    return results
      .filter(r => (r.score ?? 1) < 0.5)
      .slice(0, 3)
      .map(r => r.item);
}

export async function getChatResponse(
  history: ChatMessage[]
): Promise<{ id: string; role: "assistant"; content: string; products?: Product[] }> {
  const lastMessage = history[history.length - 1];
  const query = lastMessage.content;
  const productContext = lastMessage.productContext;
  
  // A mock order history for better recommendations.
  const orderHistory = `
    - 1x Organic Bananas
    - 2x Whole Milk
    - 1x Sourdough Bread
  `;
  
  const userId = auth.currentUser?.uid;
  let userProfile: UserData | null = null;
  if (userId) {
    userProfile = await getUserData(userId);
  }

  // 1. Call the AI flow with the user's query.
  const result: ChatShoppingOutput = await chatShopping({ 
    query, 
    orderHistory, 
    productContext,
    userId: userId,
    userProfile: userProfile ? JSON.stringify(userProfile) : undefined,
  });

  let productList: Product[] = [];
  
  // 2. Check if the AI returned a list of product names in the `productList` field.
  if (result.productList && result.productList.length > 0) {
    // 3. Fetch all products from the database.
    const { products: allProducts, error } = await getProducts();
    if (!error && allProducts.length > 0) {
       // 4. Filter the database products to find the ones the AI suggested by name.
      const fuse = new Fuse(allProducts, { keys: ['name'], threshold: 0.3 });
      const matchedProducts = new Set<Product>();

      result.productList.forEach(productName => {
        const matches = fuse.search(productName);
        if (matches.length > 0) {
          matchedProducts.add(matches[0].item);
        }
      });
      productList = Array.from(matchedProducts);
    }
  }


  // 5. Return a complete object with the AI text and the full product data.
  return {
    id: Date.now().toString(),
    role: "assistant",
    content: result.response,
    products: productList.length > 0 ? productList : undefined,
  };
}

export async function getChatResponseWithImage(
    history: ChatMessage[],
    photoDataUri: string
  ): Promise<{ id: string; role: 'assistant'; content: string; products?: Product[] }> {
    const lastMessage = history[history.length - 1];
    const query = lastMessage.content;

    // 1. Call the item recommendation flow with the image
    const recommendationResult = await itemRecommendation({ photoDataUri });

    if (!recommendationResult.isProduct || !recommendationResult.productDescription) {
        return {
            id: Date.now().toString(),
            role: 'assistant',
            content: "I'm sorry, I couldn't identify a product in that image. Could you try a different one?",
        };
    }

    // 2. Find matching products in the database based on the description
    const matchedProducts = await findMatchingProducts(recommendationResult.productDescription);

    if (matchedProducts.length === 0) {
        return {
            id: Date.now().toString(),
            role: 'assistant',
            content: `I think I see a ${recommendationResult.productDescription}, but I couldn't find an exact match in our store right now.`,
        };
    }

    // 3. If we have matches, call the regular chat flow to generate a nice response
    const productContext = {
        name: matchedProducts.map(p => p.name).join(', '),
        description: `The user uploaded an image which was identified as '${recommendationResult.productDescription}'. I have found these potential matches: ${matchedProducts.map(p => p.name).join(', ')}. The user's query is: ${query === "Here's an image." ? "Are any of these available?" : query}`
    }

    const chatResult = await chatShopping({
        query: productContext.description,
    });

    return {
        id: Date.now().toString(),
        role: 'assistant',
        content: chatResult.response,
        products: matchedProducts,
    };
}

export async function cancelOrder(orderId: string): Promise<{ success: boolean, message: string }> {
    if (!orderId) {
        return { success: false, message: 'Order ID is required.' };
    }

    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status: 'Cancelled',
            active: false,
            cancelledAt: serverTimestamp(),
        });
        return { success: true, message: 'Order has been cancelled.' };
    } catch (error) {
        console.error('Error cancelling order:', error);
        return { success: false, message: 'Failed to cancel the order.' };
    }
}
