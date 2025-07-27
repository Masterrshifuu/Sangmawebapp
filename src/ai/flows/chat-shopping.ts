
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
  response: z.string().describe('The AI response to the user query. This should be a friendly, conversational response.'),
  productList: z
    .array(z.string())
    .optional()
    .describe('A list of exactly matching product names if the user asks for products. This list will be used to fetch product data from the database.'),
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
  prompt: `You are Sangma, a friendly and highly capable shopping assistant for Sangma Megha Mart.
Your goal is to provide a seamless and helpful shopping experience.

- **Always be conversational and friendly.**
- **Product Recommendations**: If the user asks for products (e.g., "show me biscuits", "any healthy snacks?"), your primary goal is to populate the 'productList' field with relevant product names. Your 'response' text should be a friendly message like "Here are some biscuits I found for you!". Do not list the products in the response text itself; put them in the productList field.
- **Be Specific**: When populating 'productList', use specific product names that you believe exist, like "Parle-G Gold Biscuits" or "Britannia NutriChoice Biscuits".
- **Context is Key**: Use the user's order history and current product view to make smarter recommendations.
- **General Chat**: If the user is just chatting, have a normal conversation and leave the 'productList' field empty.

User's ID: {{userId}}
User's Profile Data: {{{userProfile}}}

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
    const { output } = await chatShoppingPrompt(input);
    
    if (output) {
      return output;
    }

    // Fallback in case the model doesn't return a structured output
    return {
      response: "I'm sorry, I had a little trouble thinking. Could you try asking that again?",
      productList: [],
    };
  }
);
