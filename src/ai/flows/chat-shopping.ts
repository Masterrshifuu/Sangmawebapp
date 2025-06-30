'use server';

/**
 * @fileOverview An AI shopping assistant that provides conversational responses and product recommendations.
 *
 * - chatShopping - A function that handles the chat shopping process.
 * - ChatShoppingInput - The input type for the chatShopping function.
 * - ChatShoppingOutput - The return type for the chatShopping function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchProducts } from '@/lib/search';
import type { Product } from '@/lib/types';

const productSearchTool = ai.defineTool(
    {
        name: 'productSearch',
        description: 'Searches for products in the store based on a user query. Returns a list of products.',
        inputSchema: z.object({ query: z.string() }),
        outputSchema: z.array(z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            price: z.number(),
            imageUrl: z.string(),
            category: z.string(),
            bestseller: z.boolean(),
        })),
    },
    async ({ query }) => {
        // Use the existing search function
        const products = await searchProducts(query);
        // Limit to 10 products to avoid overwhelming the user or context window
        return products.slice(0, 10);
    }
);

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ChatShoppingInputSchema = z.object({
  query: z.string().describe('The latest user query about products.'),
  history: z.array(ChatMessageSchema).optional().describe("The previous conversation history."),
});
export type ChatShoppingInput = z.infer<typeof ChatShoppingInputSchema>;


const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    imageUrl: z.string(),
    category: z.string(),
    bestseller: z.boolean(),
});

const ChatShoppingOutputSchema = z.object({
  response: z.string().describe('The conversational response to the user query.'),
  recommendedProducts: z.array(ProductSchema).optional().describe('A list of recommended products to display to the user, if any were found.'),
});
export type ChatShoppingOutput = z.infer<typeof ChatShoppingOutputSchema>;

export async function chatShopping(input: ChatShoppingInput): Promise<ChatShoppingOutput> {
  return chatShoppingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatShoppingPrompt',
  input: {schema: ChatShoppingInputSchema},
  output: {schema: ChatShoppingOutputSchema},
  tools: [productSearchTool],
  prompt: `You are a helpful and friendly AI shopping assistant for 'Sangma Megha Mart'.
Your goal is to have a natural conversation with the user and help them find products.
Maintain the flow of conversation.

- If the user asks for products (e.g., "find me some coffee", "do you have shampoo?"), use the 'productSearch' tool to find relevant items from the store.
- After using the tool, take the list of products it returns and place them in the 'recommendedProducts' output field.
- Also, provide a friendly, conversational text 'response' to the user, for example, "Here are some products I found for you:".
- If the tool returns no products, inform the user in your 'response' that you couldn't find anything and suggest they try a different search. In this case, 'recommendedProducts' should be empty or not present.
- Do not make up products. Only use the information from the 'productSearch' tool.

Conversation History:
{{#if history}}
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}

Latest User Query:
{{{query}}}
`,
});

const chatShoppingFlow = ai.defineFlow(
  {
    name: 'chatShoppingFlow',
    inputSchema: ChatShoppingInputSchema,
    outputSchema: ChatShoppingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
