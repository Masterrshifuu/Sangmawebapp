'use server';

/**
 * @fileOverview AI flow for recommending products based on search input.
 *
 * - itemRecommendation - A function that handles the item recommendation process.
 * - ItemRecommendationInput - The input type for the itemRecommendation function.
 * - ItemRecommendationOutput - The return type for the itemRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ItemRecommendationInputSchema = z.object({
  searchInput: z.string().describe('The user input for searching products.'),
});
export type ItemRecommendationInput = z.infer<typeof ItemRecommendationInputSchema>;

const ItemRecommendationOutputSchema = z.object({
  recommendedProducts: z.array(
    z.object({
      name: z.string().describe('The name of the product.'),
      description: z.string().describe('A short description of the product.'),
      price: z.number().describe('The price of the product.'),
      imageUrl: z.string().describe('URL of the product image.'),
    })
  ).describe('A list of recommended products based on the search input.'),
});
export type ItemRecommendationOutput = z.infer<typeof ItemRecommendationOutputSchema>;

export async function itemRecommendation(input: ItemRecommendationInput): Promise<ItemRecommendationOutput> {
  return itemRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'itemRecommendationPrompt',
  input: {schema: ItemRecommendationInputSchema},
  output: {schema: ItemRecommendationOutputSchema},
  prompt: `You are an AI shopping assistant for 'Sangma Megha Mart'. Your goal is to help users find products even if their search query doesn't have an exact match.
Recommend a list of relevant products based on the user's search input.
If the search input is very specific and no direct match is likely, recommend the closest available alternatives or related product categories. For example, if a user searches for a specific brand you don't carry, suggest similar products from other brands. If they search for something abstract like 'party snacks', suggest items like chips, nuts, and drinks.

Search Input: {{{searchInput}}}

Return a list of recommended products with their name, description, price, and image URL. If you cannot find any relevant products, return an empty list.`,
});

const itemRecommendationFlow = ai.defineFlow(
  {
    name: 'itemRecommendationFlow',
    inputSchema: ItemRecommendationInputSchema,
    outputSchema: ItemRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output || { recommendedProducts: [] };
  }
);
