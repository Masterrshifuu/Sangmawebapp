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
      role: z.enum(['user', 'assistant']),
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
  system: `You are an intelligent shopping assistant for Sangma Megha Mart.

Your core functions:
1. Help users find **purchasable products** from the store using the \`productSearch\` tool.
2. Handle **cart actions** like:
   - "Add this to cart", "Remove from cart", "Show cart", "Clear cart".
3. Manage **checkout flow**:
   - Ask for delivery address if not set.
   - Ask for payment method (COD or GPay).
   - Confirm order and respond accordingly.

You can also handle **general conversations** using web knowledge (e.g., "What is hair fall?", "Best time to eat fruits?").

🔒 IMPORTANT RULES:
- ONLY fetch purchasable products using the \`productSearch\` tool.
- NEVER make up products.
- For cart actions, identify the intent ('add', 'remove', 'show_cart', 'clear_cart') and the product involved. Then formulate a clear response (e.g., “Added Dove Shampoo to your cart”).
- If the cart is empty during checkout, tell the user.
- If the user hasn't set an address or payment method, politely ask them to do so.
`,
});

// The main exported function that ties everything together.
export async function chatShopping(input: ChatShoppingInput): Promise<ChatShoppingOutput> {
  const allProducts = await getProducts();
  let currentCart = input.cart || [];
  let recommendedProducts: Product[] = [];
  
  // Augment the user query with the current cart context for the AI
  const queryWithContext = `User query: "${input.query}" \n\nCurrent cart: ${JSON.stringify(currentCart.map(p => p.name))}`;

  // Call the AI with the prompt, tools, and context
  const { output } = await chatPrompt(queryWithContext, { history: input.history });
  
  if (!output) {
    return {
      response: "I'm sorry, I had trouble understanding that. Could you please rephrase?",
      updatedCart: currentCart,
      recommendedProducts: [],
    };
  }

  const { intent, productIdentifier, response } = output;
  let finalResponse = response;

  // Use the AI's identified intent to perform actions
  switch (intent) {
    case 'search':
      // The tool call is handled automatically by Genkit if the AI decides to use it.
      // The 'response' from the AI will already contain the summary of the tool's output.
      // We just need to get the products to send back to the client for display.
      if (input.query) {
        recommendedProducts = await searchProducts(input.query);
      }
      break;

    case 'add':
      if (productIdentifier) {
        const productToAdd = allProducts.find(p => p.name.toLowerCase().includes(productIdentifier.toLowerCase()));
        if (productToAdd) {
          currentCart.push(productToAdd);
          finalResponse = `Added ${productToAdd.name} to your cart.`;
        } else {
          finalResponse = `I couldn't find a product called "${productIdentifier}". Please try searching for it first.`;
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
            // In a real app, this would trigger a multi-step process.
            // For now, we simulate the first step.
            finalResponse = "Great! To proceed with checkout, I need your delivery address. What is your full address?";
        }
      break;

    case 'general':
    default:
      // The AI's conversational response is used directly.
      break;
  }

  // Return the final state to the client
  return {
    response: finalResponse,
    updatedCart: currentCart,
    recommendedProducts: recommendedProducts,
  };
}
