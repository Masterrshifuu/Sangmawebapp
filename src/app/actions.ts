
"use server";

import { chatShopping, ChatShoppingOutput } from "@/ai/flows/chat-shopping";
import { itemRecommendation } from "@/ai/flows/item-recommendation";
import { getProducts } from "@/lib/products";
import type { Product, AIState } from "@/lib/types";
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

  // 1. Call the AI flow with the user's query and optional product context
  const result: ChatShoppingOutput = await chatShopping({ query, orderHistory, productContext });

  let productList: Product[] = [];
  // 2. Check if the AI returned a list of product names
  if (result.productList && result.productList.length > 0) {
    // 3. Fetch all products from the database
    const { products: allProducts, error } = await getProducts();
    if (!error) {
       // 4. Filter the database products to find the ones the AI suggested
      productList = allProducts.filter(p => result.productList!.some(rp => p.name.toLowerCase().includes(rp.toLowerCase())));
    }
  }

  // 5. Return a complete object with the AI text and the full product data
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
