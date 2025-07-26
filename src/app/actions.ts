
"use server";

import { chatShopping, ChatShoppingOutput } from "@/ai/flows/chat-shopping";
import { getProducts } from "@/lib/products";
import type { Product, AIState } from "@/lib/types";

// This is a new type to handle the optional product context in chat history
type ChatMessage = AIState[number] & {
    productContext?: { name: string; description: string };
};

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
