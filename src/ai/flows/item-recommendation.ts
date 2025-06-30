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
import { getProducts } from '@/lib/data';

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
      imageUrl: z.string().describe("URL of the product image. This should always be 'https://placehold.co/300x300.png'."),
    })
  ).describe('A list of recommended products based on the search input.'),
});
export type ItemRecommendationOutput = z.infer<typeof ItemRecommendationOutputSchema>;

export async function itemRecommendation(input: ItemRecommendationInput): Promise<ItemRecommendationOutput> {
  return itemRecommendationFlow(input);
}

const ItemRecommendationPromptInputSchema = z.object({
    searchInput: z.string(),
    productList: z.string(),
});

const prompt = ai.definePrompt({
  name: 'itemRecommendationPrompt',
  input: {schema: ItemRecommendationPromptInputSchema},
  output: {schema: ItemRecommendationOutputSchema},
  prompt: `You are an AI shopping assistant for 'Sangma Megha Mart'. Your goal is to recommend products from a given list based on a user's search query.

You MUST only recommend products that are present in the 'Available Products' list provided below. Do not invent products or details.
Your recommendations should be relevant to the user's search input. Please recommend between 10 and 15 products. If the search input is generic (e.g., 'featured products', 'popular items'), recommend a variety of popular products. If there are no relevant products in the list, return an empty list of recommendations.

Search Input: {{{searchInput}}}

Available Products (JSON format):
{{{productList}}}

For each recommended product, provide its name, a short description, price, and use 'https://placehold.co/300x300.png' for the imageUrl.`,
});

const itemRecommendationFlow = ai.defineFlow(
  {
    name: 'itemRecommendationFlow',
    inputSchema: ItemRecommendationInputSchema,
    outputSchema: ItemRecommendationOutputSchema,
  },
  async input => {
    const allProducts = await getProducts();
    const productListJson = JSON.stringify(allProducts.map(p => ({
        name: p.name,
        description: p.description,
        price: p.price
    })));

    const {output} = await prompt({
        searchInput: input.searchInput,
        productList: productListJson
    });
    
    return output || { recommendedProducts: [] };
  }
);
