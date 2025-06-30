'use server';

/**
 * @fileOverview An AI shopping assistant that provides conversational responses to user questions about products.
 *
 * - chatShopping - A function that handles the chat shopping process.
 * - ChatShoppingInput - The input type for the chatShopping function.
 * - ChatShoppingOutput - The return type for the chatShopping function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatShoppingInputSchema = z.object({
  query: z.string().describe('The user query about products.'),
});
export type ChatShoppingInput = z.infer<typeof ChatShoppingInputSchema>;

const ChatShoppingOutputSchema = z.object({
  response: z.string().describe('The conversational response to the user query.'),
});
export type ChatShoppingOutput = z.infer<typeof ChatShoppingOutputSchema>;

export async function chatShopping(input: ChatShoppingInput): Promise<ChatShoppingOutput> {
  return chatShoppingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatShoppingPrompt',
  input: {schema: ChatShoppingInputSchema},
  output: {schema: ChatShoppingOutputSchema},
  prompt: `You are a helpful AI shopping assistant. A user is asking you questions about products.
  Provide a conversational response to the user query.
  User Query: {{{query}}}`,
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
