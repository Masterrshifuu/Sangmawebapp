import { z } from 'zod';
import { defineFlow, defineTool, invokeTool } from 'genkit';
import { structuredOutput } from '@genkit-ai/ai';
import { definePrompt, chat, imageData } from 'ai/prompts';
import { Firestore } from '@google-cloud/firestore';

// Initialize Firestore
const db = new Firestore();

// Define tool schema
const ShowProductArgs = z.object({
  category: z.string().describe('Category of the product'),
});

// Tool: Show product from Firestore by category
export const showProduct = defineTool({
  name: 'showProduct',
  description: 'Fetch products by category from Firestore',
  inputSchema: ShowProductArgs,
  handler: async (args) => {
    const snapshot = await db.collection('products')
      .where('category', '==', args.category)
      .limit(3)
      .get();

    if (snapshot.empty) {
      return `No products found for category: ${args.category}`;
    }

    const products = snapshot.docs.map((doc) => doc.data());
    return products.map((p) => `${p.name} - ₹${p.price}`).join('\n');
  },
});

// Define the prompt
export const prompt = definePrompt({
  name: 'chatShoppingPrompt',
  kind: 'chat',
  config: {
    model: 'gemini-1.5-pro',
    tools: [showProduct],
  },
  inputSchema: z.object({
    message: z.string(),
    photoDataUri: z.string().optional(),
    history: z.any().optional(),
  }),
  generate: async ({ message, photoDataUri, history }) => {
    const input = [
      ...(photoDataUri
        ? [imageData(photoDataUri, 'user uploaded photo')]
        : []),
      message,
    ];

    const response = await chat({
      model: 'gemini-1.5-pro',
      messages: [
        ...(history ?? []),
        { role: 'user', content: input },
      ],
      tools: [showProduct],
    });

    return response;
  },
});

// Define the flow
export const chatShoppingFlow = defineFlow(
  {
    name: 'chatShoppingFlow',
    inputSchema: z.object({
      message: z.string(),
      photoDataUri: z.string().optional(),
      history: z.any().optional(),
    }),
    outputSchema: z.object({
      message: z.string(),
      history: z.any(),
    }),
  },
  async ({ message, photoDataUri, history }) => {
    const llmResponse = await prompt({
      message,
      photoDataUri,
      history,
    });

    // Safely handle tool calls
    const toolCalls =
      llmResponse?.toolResponses?.flatMap((r: any) => r.tools || []) || [];

    const toolResponses = [];
    for (const call of toolCalls) {
      const result = await invokeTool(call);
      toolResponses.push(result);
    }

    return {
      message:
        toolResponses.length > 0
          ? toolResponses.join('\n')
          : structuredOutput(llmResponse),
      history: llmResponse.history,
    };
  }
);
