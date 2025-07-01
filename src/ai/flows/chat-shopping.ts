'use server';

/**
 * @fileOverview An AI-powered product search for the chat assistant.
 *
 * - chatShopping - A function that handles product search within the chat.
 * - ChatShoppingInput - The input type for the chatShopping function.
 * - ChatShoppingOutput - The return type for the chatShopping function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchProducts } from '@/lib/search';
import { itemRecommendation } from '@/ai/flows/item-recommendation';
import type { Product } from '@/lib/types';

const ChatShoppingInputSchema = z.object({
  query: z.string().describe('The latest user query about products.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The previous conversation history.'),
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
  recommendedProducts: z
    .array(ProductSchema)
    .default([])
    .describe('A list of products found.'),
});
export type ChatShoppingOutput = z.infer<typeof ChatShoppingOutputSchema>;

export async function chatShopping(
  input: ChatShoppingInput
): Promise<ChatShoppingOutput> {
  return chatShoppingFlow(input);
}

const chatShoppingFlow = ai.defineFlow(
  {
    name: 'chatShoppingFlow',
    inputSchema: ChatShoppingInputSchema,
    outputSchema: ChatShoppingOutputSchema,
  },
  async ({ query }) => {
    // 1. Try direct search first, just like the main search functionality
    const directSearchResults = await searchProducts(query);

    if (directSearchResults.length > 0) {
      return {
        response: `Yes, I found ${directSearchResults.length} item(s) for you:`,
        recommendedProducts: directSearchResults,
      };
    }

    // 2. If no direct results, fall back to AI recommendation
    try {
      const aiResults = await itemRecommendation({ searchInput: query });

      const mappedProducts: Product[] = aiResults.recommendedProducts.map(
        (p, index) => ({
          id: `${p.name.replace(/\s+/g, '-')}-${index}`,
          ...p,
          category: 'Recommended',
          bestseller: false,
        })
      );

      if (mappedProducts.length > 0) {
        return {
          response:
            "I couldn't find an exact match, but based on your search, you might like these:",
          recommendedProducts: mappedProducts,
        };
      }
    } catch (error) {
      console.error('AI recommendation in chat failed:', error);
      // Fall through to the "not found" message
    }

    // 3. If still no results, return an empty response
    return {
      response:
        "I'm sorry, I couldn't find any products matching your search. Please try different keywords.",
      recommendedProducts: [],
    };
  }
);
