
'use server';
/**
 * @fileOverview A shopping assistant AI agent.
 *
 * - chat - A function that handles the shopping chat process.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getProductSuggestions } from './chat-tools';
import { Product } from '@/lib/types';
import { getProducts } from '@/lib/products';

const ChatInputSchema = z.object({
  history: z.array(z.any()).optional(),
  message: z.string().describe('The user\'s message.'),
  photoDataUri: z.string().optional().describe(
      "A photo related to the user's query, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user.'),
  products: z.array(z.any()).optional().describe('A list of relevant product recommendations.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatShoppingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatShoppingPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  tools: [getProductSuggestions],
  system: `You are a friendly and helpful shopping assistant for Sangma Megha Mart, an online grocery store in Tura.
- Your goal is to help users find products, provide recommendations, and answer questions about groceries.
- If a user asks for a recipe, provide one and use the getProductSuggestions tool to recommend the necessary ingredients available in the store.
- If the user provides a photo, analyze it and provide relevant product suggestions. For example, if they show a picture of a coffee mug, suggest different types of coffee available.
- Be concise and conversational.
- When recommending products, clearly state their names and prices.
- Do not make up products or prices. Only use the information from the getProductSuggestions tool.`,
  prompt: `User message: {{{message}}}
{{#if photoDataUri}}
[User has provided this image: {{media url=photoDataUri}}]
{{/if}}`,
});

const chatShoppingFlow = ai.defineFlow(
  {
    name: 'chatShoppingFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { history, message, photoDataUri } = input;
    const llmResponse = await prompt({
        message,
        photoDataUri,
        history: history || [],
    });
    const { output } = llmResponse;
    if (!output) {
      return { response: "I'm sorry, I couldn't generate a response." };
    }

    // Check if the model decided to use the product suggestion tool
    const toolCalls = llmResponse.requests.flatMap(r => r.tools || []);
    if (toolCalls.length > 0) {
        const productNames = toolCalls.flatMap(call =>
            (call.input as { queries: string[] }).queries
        );

        if (productNames.length > 0) {
            const { products: allProducts } = await getProducts();
            const recommendedProducts = allProducts.filter(p =>
                productNames.some(name =>
                    p.name.toLowerCase().includes(name.toLowerCase()) ||
                    p.tags?.some(tag => tag.toLowerCase().includes(name.toLowerCase()))
                )
            ).slice(0, 5); // Limit to 5 recommendations

            return {
                response: output.response,
                products: recommendedProducts,
            };
        }
    }

    return {
        response: output.response,
        products: output.products || [],
    };
  }
);
