
'use server';
/**
 * @fileOverview A shopping assistant AI flow.
 *
 * - chatShopping - A function that handles the chat interaction.
 * - ChatShoppingInput - The input type for the chatShopping function.
 * - ChatShoppingOutput - The return type for the chatShopping function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {getProducts} from '@/lib/products';
import type {Product} from '@/lib/types';
import Fuse from 'fuse.js';

// Input and Output Schemas
const ChatShoppingInputSchema = z.object({
  message: z.string(),
  history: z.array(z.any()).optional(),
});
export type ChatShoppingInput = z.infer<typeof ChatShoppingInputSchema>;

const ChatShoppingOutputSchema = z.object({
  response: z.string(),
  products: z.array(z.any()).optional(),
});
export type ChatShoppingOutput = z.infer<typeof ChatShoppingOutputSchema>;

// Tool: Product Suggestions
const getProductSuggestions = ai.defineTool(
  {
    name: 'getProductSuggestions',
    description:
      'Get a list of product suggestions based on a search query. Use this to help users find products.',
    inputSchema: z.object({
      query: z.string().describe('The user query to search for products.'),
    }),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        category: z.string(),
        price: z.number(),
        description: z.string(),
      })
    ),
  },
  async input => {
    console.log(`Searching for products with query: ${input.query}`);
    const {products} = await getProducts();
    const fuse = new Fuse(products, {
      keys: ['name', 'category', 'description', 'tags'],
      threshold: 0.4,
    });
    const results = fuse.search(input.query, {limit: 5});
    return results.map(r => ({
      id: r.item.id,
      name: r.item.name,
      category: r.item.category,
      price: r.item.mrp ?? r.item.price,
      description: r.item.description,
    }));
  }
);

// Main chatShopping function (exported)
export async function chatShopping(
  input: ChatShoppingInput
): Promise<ChatShoppingOutput> {
  return await chatShoppingFlow(input);
}

// Genkit Flow
const chatShoppingFlow = ai.defineFlow(
  {
    name: 'chatShoppingFlow',
    inputSchema: ChatShoppingInputSchema,
    outputSchema: ChatShoppingOutputSchema,
  },
  async ({message, history}) => {
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      tools: [getProductSuggestions],
      system: `You are a friendly and helpful shopping assistant for Sangma Megha Mart, an online grocery store.
      - Your goal is to help users find products and answer their questions.
      - Use the getProductSuggestions tool to find relevant products when the user asks for them.
      - If the tool returns products, mention them in your response and you can also return the product data.
      - If the tool returns no products, inform the user that you couldn't find what they were looking for.
      - Keep your responses concise and helpful.`,
      history: history || [],
      prompt: message,
    });

    const toolResponsePart = llmResponse.part('toolRequest');
    if (toolResponsePart) {
      // We are just returning the text for now, but in a real app you might want to call the tool
      // and continue the generation.
    }

    const textResponse = llmResponse.text;
    const productsResponse =
      (llmResponse.part('toolResponse')?.output as Product[]) || [];

    return {
      response: textResponse,
      products: productsResponse,
    };
  }
);
