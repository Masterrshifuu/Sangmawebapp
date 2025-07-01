'use server';

/**
 * @fileOverview An AI-powered shopping assistant that can search for products and manage a shopping cart.
 *
 * - chatShopping - A function that handles the entire chat interaction.
 * - ChatShoppingInput - The input type for the chatShopping function.
 * - ChatShoppingOutput - The return type for the chatShopping function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchProducts } from '@/lib/search';
import type { Product, Message } from '@/lib/types';
import { getProducts } from '@/lib/data';

// Define the schema for a single product, to be used in various places.
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  imageUrl: z.string(),
  category: z.string(),
  bestseller: z.boolean(),
});

// Input schema for the main chat flow
const ChatShoppingInputSchema = z.object({
  query: z.string().describe('The latest user query.'),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'tool']),
      content: z.string(),
    })
  ).optional().describe('The previous conversation history.'),
  cart: z.array(ProductSchema).optional().default([]).describe('The current state of the shopping cart.'),
});
export type ChatShoppingInput = z.infer<typeof ChatShoppingInputSchema>;

// Output schema for the main chat flow, which will be sent to the client
const ChatShoppingOutputSchema = z.object({
  response: z.string().describe('The conversational response to the user.'),
  recommendedProducts: z.array(ProductSchema).default([]).describe('A list of products to display, usually from a search.'),
  updatedCart: z.array(ProductSchema).default([]).describe('The new state of the cart after the requested action.'),
});
export type ChatShoppingOutput = z.infer<typeof ChatShoppingOutputSchema>;

// This is the only tool the AI needs. It allows the AI to search for products in the database.
const productSearchTool = ai.defineTool(
  {
    name: 'productSearch',
    description: 'Searches for purchasable products from the store based on a user query.',
    inputSchema: z.string(),
    outputSchema: z.array(ProductSchema),
  },
  async (query) => searchProducts(query)
);

// This is the schema for the AI's internal "thinking" process. We ask the AI to provide
// not just a response, but also to identify the user's intent and any relevant product details.
const AiResponseSchema = z.object({
  intent: z.enum(['search', 'add', 'remove', 'show_cart', 'clear_cart', 'checkout', 'general'])
    .describe("The user's primary intent. 'search' for finding products. 'add' to add to cart. 'remove' to remove from cart. 'show_cart' to display cart. 'clear_cart' to empty the cart. 'checkout' to begin checkout. 'general' for anything else."),
  productIdentifier: z.string().optional().describe("The name, brand, or specific detail of the product the user is talking about. e.g., 'Dove shampoo', 'the face wash', 'Himalaya Damage Repair'."),
  response: z.string().describe("The final, user-facing conversational response."),
});

// The main prompt that drives the AI assistant.
const chatPrompt = ai.definePrompt({
  name: 'chatShoppingPrompt',
  tools: [productSearchTool],
  output: { schema: AiResponseSchema },
  system: `
You are an intelligent shopping assistant for Sangma Megha Mart.

You have 4 responsibilities:

1. 🛍️ Product Search (ONLY from database):
   - Use the \`productSearch\` tool to find exact or fuzzy matches.
   - Never invent or hallucinate products.

2. 🛒 Cart Management:
   - User might say: "Add Dove shampoo", "Remove hair oil", "Show my cart", "Clear all".
   - Match products from the catalog and update the cart accordingly.

3. 📦 Checkout Handling:
   - If user says: "Checkout", ask if cart is empty.
   - If cart has items, ask for **delivery address** if not already provided.
   - Then ask for **payment mode** (COD or GPay).
   - Confirm the order.

4. 🌐 Web Knowledge:
   - Answer questions like "What is dandruff?", "How to treat dry scalp?" from general knowledge.

🔐 Rules:
- Use \`productSearch\` only for real purchasable products.
- Don't generate fake product names.
- Keep your tone helpful and clear.
- If the user sends multiple requests, break it down step-by-step.
- If user’s address or payment isn’t set during checkout, ask for it.
- Cart you manage is separate from main UI cart, but will sync later.

Respond naturally like a smart AI shopping assistant.`,
});

// The main exported function that ties everything together.
export async function chatShopping(input: ChatShoppingInput): Promise<ChatShoppingOutput> {
  const allProducts = await getProducts();
  let currentCart = input.cart || [];
  let recommendedProducts: Product[] = [];
  
  const queryWithContext = `User query: "${input.query}" \n\nCurrent cart: ${JSON.stringify(currentCart.map(p => p.name))}`;

  const llmResponse = await chatPrompt(queryWithContext, { history: input.history as Message[] });
  const aiOutput = llmResponse.output();

  if (!aiOutput) {
    return {
      response: "I'm sorry, I had trouble understanding that. Could you please rephrase?",
      updatedCart: currentCart,
      recommendedProducts: [],
    };
  }

  // If the AI used the search tool, extract the results to display them.
  if (llmResponse.toolCalls) {
    recommendedProducts = llmResponse.toolCalls
      .map(tc => tc.output as Product[])
      .flat()
      .filter(Boolean);
  }

  const { intent, productIdentifier, response } = aiOutput;
  let finalResponse = response;

  switch (intent) {
    case 'add':
      if (productIdentifier) {
        // Find product case-insensitively
        const productToAdd = allProducts.find(p => p.name.toLowerCase().includes(productIdentifier.toLowerCase()));
        if (productToAdd) {
          // Avoid duplicates, just use the one from the master list.
          if (!currentCart.find(p => p.id === productToAdd.id)) {
            currentCart.push(productToAdd);
          }
          finalResponse = `Added ${productToAdd.name} to your cart.`;
        } else {
          finalResponse = `I couldn't find a product called "${productIdentifier}". Try searching for it first.`;
        }
      }
      break;

    case 'remove':
      if (productIdentifier) {
        const indexToRemove = currentCart.findIndex(p => p.name.toLowerCase().includes(productIdentifier.toLowerCase()));
        if (indexToRemove > -1) {
          const removedProduct = currentCart[indexToRemove];
          currentCart.splice(indexToRemove, 1);
          finalResponse = `Removed ${removedProduct.name} from your cart.`;
        } else {
          finalResponse = `I couldn't find "${productIdentifier}" in your cart.`;
        }
      }
      break;
    
    case 'show_cart':
        if (currentCart.length > 0) {
            const cartItemsText = currentCart.map(p => p.name).join(', ');
            finalResponse = `Here's what's in your cart: ${cartItemsText}. You have ${currentCart.length} item(s).`;
        } else {
            finalResponse = "Your cart is currently empty.";
        }
      break;

    case 'clear_cart':
      currentCart = [];
      finalResponse = "I've cleared your cart.";
      break;
      
    case 'checkout':
        if (currentCart.length === 0) {
            finalResponse = "Your cart is empty! Please add some items before checking out.";
        } else {
            finalResponse = "Great! To proceed with checkout, I need your delivery address. What is your full address?";
        }
      break;
    
    case 'search':
    case 'general':
    default:
      // For search and general, the response from the AI is sufficient.
      // Product recommendations from the tool call are already handled above.
      break;
  }

  return {
    response: finalResponse,
    updatedCart: currentCart,
    recommendedProducts: recommendedProducts,
  };
}
