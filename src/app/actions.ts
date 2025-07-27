
"use server";

import { chatShopping, ChatShoppingOutput } from "@/ai/flows/chat-shopping";
import { itemRecommendation } from "@/ai/flows/item-recommendation";
import { getProducts, getProductById } from "@/lib/products";
import type { Product, AIState, UserData } from "@/lib/types";
import { getUserData } from "@/lib/user";
import { auth } from "@/lib/firebase";
import Fuse from 'fuse.js';


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

  // Call the AI flow. The flow now handles tools, so it might search for products itself.
  const result: ChatShoppingOutput = await chatShopping({ 
    query, 
    orderHistory, 
    productContext,
    userId: userId,
    userProfile: userProfile ? JSON.stringify(userProfile) : undefined,
  });

  // The AI's textual response might contain a JSON string from a tool.
  // We need to parse this to extract product data if it exists.
  let productList: Product[] = [];
  try {
      // Look for a JSON array within the AI's response text.
      // This regex is designed to find a JSON array of objects.
      const jsonMatch = result.response.match(/\[\s*\{[\s\S]*?\}\s*]/);
      if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(item => item.id && item.name)) {
              // We have a list of products from a tool call. Fetch full data.
              const productIds = parsed.map(p => p.id);
              const productPromises = productIds.map(id => getProductById(id));
              const productResults = await Promise.all(productPromises);
              productList = productResults
                  .filter(res => res.product !== null)
                  .map(res => res.product as Product);
          }
      }
  } catch (e) {
      // It's okay if parsing fails, it just means there was no JSON to parse.
      console.log("No product JSON found in AI response, or it was invalid.");
  }
  
  // This part handles cases where the AI *doesn't* use a tool but provides general recommendations
  // via the `productList` field. This is a good fallback.
  if (productList.length === 0 && result.productList && result.productList.length > 0) {
    const { products: allProducts, error } = await getProducts();
    if (!error) {
      productList = allProducts.filter(p => result.productList!.some(rp => p.name.toLowerCase().includes(rp.toLowerCase())));
    }
  }

  return {
    id: Date.now().toString(),
    role: "assistant",
    content: result.response.replace(/\[\s*\{[\s\S]*?\}\s*]/, '').trim(), // Clean the JSON from the response text
    // The `products` key is now populated from either a tool call or the fallback list.
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
