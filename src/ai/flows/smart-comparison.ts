'use server';

/**
 * @fileOverview Implements the smart comparison feature, allowing users to compare products based on price and nutritional value.
 *
 * - compareProducts - A function that handles the product comparison process.
 * - CompareProductsInput - The input type for the compareProducts function.
 * - CompareProductsOutput - The return type for the compareProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

const CompareProductsInputSchema = z.object({
  product1Name: z.string().describe('The name of the first product to compare.'),
  product2Name: z.string().describe('The name of the second product to compare.'),
});
export type CompareProductsInput = z.infer<typeof CompareProductsInputSchema>;

const CompareProductsOutputSchema = z.object({
  product1: z.object({
    name: z.string().describe('The name of the first product.'),
    price: z.number().describe('The price of the first product.'),
    nutritionalInfo: z.string().describe('Nutritional information for the first product.'),
  }).describe('Details of the first product'),
  product2: z.object({
    name: z.string().describe('The name of the second product.'),
    price: z.number().describe('The price of the second product.'),
    nutritionalInfo: z.string().describe('Nutritional information for the second product.'),
  }).describe('Details of the second product'),
  summary: z.string().describe('A summary of the comparison, including price and nutritional differences.'),
});
export type CompareProductsOutput = z.infer<typeof CompareProductsOutputSchema>;

export async function compareProducts(input: CompareProductsInput): Promise<CompareProductsOutput> {
  return compareProductsFlow(input);
}

const getProductDetails = ai.defineTool(
  {
    name: 'getProductDetails',
    description: 'Retrieves the price and nutritional information for a given product name.',
    inputSchema: z.object({
      productName: z.string().describe('The name of the product to retrieve details for.'),
    }),
    outputSchema: z.object({
      name: z.string().describe('The name of the product.'),
      price: z.number().describe('The price of the product.'),
      nutritionalInfo: z.string().describe('Nutritional information for the product.'),
    }),
  },
  async (input) => {
    // Implementation to fetch product details from Firestore.
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('name', '==', input.productName), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const productDoc = querySnapshot.docs[0];
        const productData = productDoc.data();
        return {
          name: productData.name || input.productName,
          price: productData.price || 0,
          nutritionalInfo: productData.description || 'Not available',
        };
      }
    } catch (error) {
      console.error("Error fetching product details from Firestore:", error);
    }
    
    // Return a default object if not found or if an error occurs
    return {
      name: input.productName,
      price: 0,
      nutritionalInfo: 'Details not available.',
    };
  }
);

const prompt = ai.definePrompt({
  name: 'compareProductsPrompt',
  tools: [getProductDetails],
  input: {schema: CompareProductsInputSchema},
  output: {schema: CompareProductsOutputSchema},
  prompt: `You are a helpful shopping assistant that compares two products based on their price and nutritional value.

  First, use the getProductDetails tool to retrieve the details for both products.
  Then, provide a summary of the comparison, highlighting the price and nutritional differences. If details for a product are not available, state that clearly in your summary.

  Product 1: {{{product1Name}}}
  Product 2: {{{product2Name}}}`, 
});

const compareProductsFlow = ai.defineFlow(
  {
    name: 'compareProductsFlow',
    inputSchema: CompareProductsInputSchema,
    outputSchema: CompareProductsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
