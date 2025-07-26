
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
    .describe('Recommended list of product names.'),
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
  prompt: `You are a shopping assistant. Your goal is to help the user with their shopping needs.
      You can answer questions about products, provide recommendations, and place orders.
      If the user asks for recommendations, provide a list of product names in the productList field.
      Use the order history to provide better recommendations.

      {{#if productContext}}
      The user is currently looking at the following product:
      Name: {{productContext.name}}
      Description: {{productContext.description}}
      Focus your response on this product unless the user asks about something else.
      {{/if}}

      Order History: {{{orderHistory}}}
      User Query: {{{query}}}

      Response: {{response}}`,
});

const chatShoppingFlow = ai.defineFlow(
  {
    name: 'chatShoppingFlow',
    inputSchema: ChatShoppingInputSchema,
    outputSchema: ChatShoppingOutputSchema,
  },
  async input => {
    const {output} = await chatShoppingPrompt(input);
    return output!;
  }
);
