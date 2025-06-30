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
  recommendedProducts: z.array(ProductSchema).default([]).describe('A list of products found by the productSearch tool. This MUST be empty if the tool finds no products.'),
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
  system: `You are an AI shopping assistant for 'Sangma Megha Mart'. Your SOLE purpose is to help users find products from the store's inventory using the tools provided.

**CRITICAL INSTRUCTIONS:**
1.  **ALWAYS use the \`productSearch\` tool** when the user asks for a product, expresses a need (e.g., "I need something for a headache"), or mentions any item that could be a product. Do not guess or assume.
2.  **NEVER invent or hallucinate products.** The \`recommendedProducts\` field in your output MUST ONLY contain products returned by the \`productSearch\` tool. If the tool returns an empty list, your \`recommendedProducts\` field MUST be empty.
3.  **Your text \`response\` should be based on the tool's results.**
    - If products are found, say something like: "I found these items for you:".
    - If no products are found, say: "I'm sorry, I couldn't find any products matching your search. Please try different keywords."
4.  Maintain a helpful, direct, and friendly tone.`,
  prompt: `{{#if history}}
Conversation History:
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
  async (input) => {
    const result = await prompt(input);
    const modelOutput = result.output;

    if (!modelOutput) {
      return { response: "I'm sorry, I couldn't process that. Please try again.", recommendedProducts: [] };
    }
    
    // Extract the actual product list from the tool call history to prevent hallucinations.
    let realProducts: Product[] = [];
    const toolResponseMessage = result.history.find(
      (m) => m.role === 'tool' && m.content.some(p => p.toolResponse?.name === 'productSearch')
    );

    if (toolResponseMessage) {
      const toolResponsePart = toolResponseMessage.content.find(p => p.toolResponse?.name === 'productSearch');
      const toolOutput = toolResponsePart?.toolResponse?.output;
      if (toolOutput && Array.isArray(toolOutput)) {
        realProducts = toolOutput as Product[];
      }
    }
    
    // Always return the text response from the model, but use the verified product list from the tool.
    return {
      response: modelOutput.response,
      recommendedProducts: realProducts,
    };
  }
);
