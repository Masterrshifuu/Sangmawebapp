
'use server';
/**
 * @fileOverview Tools for the shopping assistant AI agent.
 *
 * - getProductSuggestions - A tool that allows the AI to search for products.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getProducts } from '@/lib/products';
import Fuse from 'fuse.js';

export const getProductSuggestions = ai.defineTool(
    {
      name: 'getProductSuggestions',
      description: 'Get a list of product suggestions based on a search query. Use this to find ingredients for a recipe or to look up specific products.',
      inputSchema: z.object({
        queries: z.array(z.string()).describe('An array of product names or keywords to search for. For a recipe, this would be the list of ingredients.'),
      }),
      outputSchema: z.object({
        products: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            price: z.number(),
            category: z.string(),
          })
        ),
      }),
    },
    async (input) => {
      console.log(`[Tool] getProductSuggestions called with queries: ${input.queries.join(', ')}`);
      
      const { products: allProducts, error } = await getProducts();
      
      if (error) {
        console.error("Error fetching products for tool:", error);
        return { products: [] };
      }

      if (!allProducts || allProducts.length === 0) {
        return { products: [] };
      }

      const fuse = new Fuse(allProducts, {
        keys: ['name', 'category', 'tags'],
        threshold: 0.4,
        includeScore: true,
      });
      
      const searchResults = new Set<string>(); // Use a set to store IDs and avoid duplicates
      
      for (const query of input.queries) {
        const results = fuse.search(query);
        results.forEach(result => searchResults.add(result.item.id));
      }
      
      const recommendedProducts = Array.from(searchResults)
        .map(id => allProducts.find(p => p.id === id))
        .filter((p): p is NonNullable<typeof p> => !!p) // Type guard to filter out undefined
        .map(p => ({
            id: p.id,
            name: p.name,
            price: p.mrp || p.price,
            category: p.category,
        }));
      
      return { products: recommendedProducts };
    }
);
