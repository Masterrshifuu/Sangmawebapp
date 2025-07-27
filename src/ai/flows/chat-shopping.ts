
'use server';

/**
 * @fileOverview An AI-powered chat interface for shopping assistance.
 *
 * - chatShopping - A function that handles the chat shopping process.
 * - ChatShoppingInput - The input type for the chatShopping function.
 * - ChatShoppingOutput - The return type for the chatShopping function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchProducts, addToCart, getCart, placeOrder, getUserProfile } from './chat-tools';

const ChatShoppingInputSchema = z.object({
  query: z.string().describe('The user query about products or orders.'),
  userId: z.string().optional().describe("The user's unique ID."),
  userProfile: z.string().optional().describe("A JSON string of the user's profile data, including cart and address."),
  orderHistory: z
    .string()
    .optional()
    .describe('The user order history to provide better recommendations.'),
  productContext: z
    .object({
        name: z.string(),
        description: z.string(),
    })
    .optional()
    .describe('The product the user is currently viewing.'),
});
export type ChatShoppingInput = z.infer<typeof ChatShoppingInputSchema>;

// Define the required output structure for the AI
const ChatShoppingOutputSchema = z.object({
  response: z.string().describe('The AI response to the user query.'),
  productList: z
    .array(z.string())
    .optional()
    .describe('Recommended list of product names if the AI does not use a tool.'),
});
export type ChatShoppingOutput = z.infer<typeof ChatShoppingOutputSchema>;

export async function chatShopping(input: ChatShoppingInput): Promise<ChatShoppingOutput> {
  return chatShoppingFlow(input);
}

// Define the prompt that instructs the AI
const chatShoppingPrompt = ai.definePrompt({
  name: 'chatShoppingPrompt',
  input: {schema: ChatShoppingInputSchema},
  output: {schema: ChatShoppingOutputSchema},
  tools: [searchProducts, addToCart, getCart, placeOrder, getUserProfile],
  prompt: `You are Sangma, a friendly and highly capable shopping assistant for Sangma Megha Mart.
Your goal is to provide a seamless and helpful shopping experience. You can search for products, add items to the cart, check the cart's contents, and even place orders.

- **Always be conversational and friendly.**
- **Product Search**: When a user asks for products, use the 'searchProducts' tool and immediately list the results in your response. Don't just say you are searching, show the results.
- **Adding to Cart**: If the user wants to add an item to their cart, use the 'addToCart' tool. You'll need the product ID and quantity.
- **Viewing Cart**: If the user asks what's in their cart, use the 'getCart' tool.
- **Placing Orders**: To place an order, use the 'placeOrder' tool.
- **User Information**: Before placing an order, check if the user has a delivery address and phone number using the 'getUserProfile' tool. If they are missing, you MUST ask the user for this information before proceeding.
- **Recommendations**: If you are not using a tool, you can provide general recommendations and fill the productList field.
- **User Context**: The user's ID is {{userId}}. The user's profile (including address and phone) is in the following JSON string: {{{userProfile}}}.

{{#if productContext}}
The user is currently looking at the following product:
Name: {{productContext.name}}
Description: {{productContext.description}}
Focus your response on this product unless the user asks about something else.
{{/if}}

Order History: {{{orderHistory}}}
User Query: {{{query}}}
`,
});

const chatShoppingFlow = ai.defineFlow(
  {
    name: 'chatShoppingFlow',
    inputSchema: ChatShoppingInputSchema,
    outputSchema: ChatShoppingOutputSchema,
  },
  async (input) => {
    // The prompt automatically handles the tool-calling loop.
    const llmResponse = await chatShoppingPrompt(input);
    const finalResult = llmResponse.output;

    if (finalResult) {
      // If the model provided a structured output, use it.
      return finalResult;
    } else {
      // If the model did not provide a structured output (e.g., just text after a tool call),
      // create a valid output object from the raw text. This is a crucial fallback.
      return {
        response: llmResponse.text,
        productList: [],
      };
    }
  }
);
