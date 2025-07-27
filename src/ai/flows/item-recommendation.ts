
'use server';
/**
 * @fileOverview An AI flow to identify a product from an image.
 *
 * - itemRecommendation - A function that handles the product identification process.
 * - ItemRecommendationInput - The input type for the itemRecommendation function.
 * - ItemRecommendationOutput - The return type for the itemRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ItemRecommendationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ItemRecommendationInput = z.infer<typeof ItemRecommendationInputSchema>;

const ItemRecommendationOutputSchema = z.object({
  isProduct: z.boolean().describe('Whether or not the image contains a recognizable product.'),
  productDescription: z.string().optional().describe('A concise description of the product found in the image (e.g., "red apple", "bottle of whole milk").'),
});
export type ItemRecommendationOutput = z.infer<typeof ItemRecommendationOutputSchema>;

export async function itemRecommendation(input: ItemRecommendationInput): Promise<ItemRecommendationOutput> {
  return itemRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'itemRecommendationPrompt',
  input: {schema: ItemRecommendationInputSchema},
  output: {schema: ItemRecommendationOutputSchema},
  prompt: `You are an expert grocery product identifier for an online store.
Your task is to analyze the provided image and identify the main grocery item present.

Image: {{media url=photoDataUri}}

- If you see a clear grocery item (like a fruit, vegetable, milk carton, etc.), set isProduct to true and provide a short, simple description in the productDescription field.
- For example: "bunch of bananas", "carton of orange juice", "head of broccoli".
- If the image does not contain a recognizable product or is unclear, set isProduct to false.
- Do not describe the packaging in detail, just the product itself.

Provide only the JSON output.`,
});

const itemRecommendationFlow = ai.defineFlow(
  {
    name: 'itemRecommendationFlow',
    inputSchema: ItemRecommendationInputSchema,
    outputSchema: ItemRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
