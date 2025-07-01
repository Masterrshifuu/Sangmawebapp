'use server';

/**
 * @fileOverview An AI-powered shopping assistant that helps users find products conversationally.
 *
 * - chatShopping - A function that handles the chat interaction.
 * - ChatShoppingInput - The input type for the chatShopping function.
 * - ChatShoppingOutput - The return type for the chatShopping function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';

// Define the schema for a single product.
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
});
export type ChatShoppingInput = z.infer<typeof ChatShoppingInputSchema>;

// Output schema for the main chat flow
const ChatShoppingOutputSchema = z.object({
  response: z.string().describe('The conversational response to the user.'),
  recommendedProducts: z.array(ProductSchema).default([]).describe('A list of products to display, if any were found.'),
});
export type ChatShoppingOutput = z.infer<typeof ChatShoppingOutputSchema>;

const ItemRecommendationPromptInputSchema = z.object({
    query: z.string(),
    history: z.string(),
    productList: z.string(),
});

const prompt = ai.definePrompt({
  name: 'chatShoppingPrompt',
  input: {schema: ItemRecommendationPromptInputSchema},
  output: {schema: ChatShoppingOutputSchema},
  prompt: `You are a friendly and helpful AI shopping assistant for 'Sangma Megha Mart'.
Your primary goal is to help users find products from a provided list based on their search query and the ongoing conversation.

- Your response must be conversational.
- You MUST only recommend products that are present in the 'Available Products' list.
- Do not invent products, details, or prices.
- Analyze the user's query and the conversation history to understand their needs. The user might be vague (e.g., 'something for my hair') or specific.
- If you find relevant products, present them clearly.
- If no relevant products are found in the list, politely inform the user.
- Keep your tone helpful and clear.

User's Latest Query: {{{query}}}

Conversation History (JSON format):
{{{history}}}

Available Products (JSON format):
{{{productList}}}

Based on all this information, generate a conversational 'response' and a list of 'recommendedProducts'.`,
});


// The main exported function that ties everything together.
export async function chatShopping(input: ChatShoppingInput): Promise<ChatShoppingOutput> {
    const allProducts = await getProducts();
    const productListJson = JSON.stringify(allProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price
    })));

    const historyJson = JSON.stringify(input.history || []);

    const llmResponse = await prompt({
        query: input.query,
        history: historyJson,
        productList: productListJson
    });
    
    const aiOutput = llmResponse.output();

    if (!aiOutput) {
        return {
            response: "I'm sorry, I had trouble understanding that. Could you please try again?",
            recommendedProducts: [],
        };
    }

    // The AI output already contains the full response and the recommended products.
    // We just need to make sure the full product details are sent back to the client.
    const recommendedProductIds = new Set(aiOutput.recommendedProducts.map(p => p.id));
    const fullProductDetails = allProducts.filter(p => recommendedProductIds.has(p.id));

    return {
        response: aiOutput.response,
        recommendedProducts: fullProductDetails,
    };
}
