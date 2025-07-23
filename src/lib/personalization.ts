
'use client';

import type { Product } from './types';
import { getUserActivity } from './activity-tracker';

// Define weights for different types of user interactions
const SCORE_WEIGHTS = {
  viewedProduct: 50,
  viewedCategory: 20,
  searchTermMatch: 10,
  bestseller: 5,
};

/**
 * Calculates a relevance score for a product based on user activity.
 * @param product - The product to score.
 * @param activity - The user's activity summary.
 * @returns A numerical score for the product.
 */
function calculateProductScore(product: Product, activity: ReturnType<typeof getUserActivity>): number {
  let score = 0;

  // Boost score if product was directly viewed
  if (activity.viewedProductIds.has(product.id)) {
    score += SCORE_WEIGHTS.viewedProduct;
  }

  // Boost score if product is in a viewed category
  if (activity.viewedCategories.has(product.category)) {
    score += SCORE_WEIGHTS.viewedCategory;
  }

  // Boost score if product name/desc/category matches search terms
  const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
  for (const term of activity.searchTerms) {
    if (productText.includes(term)) {
      score += SCORE_WEIGHTS.searchTermMatch;
    }
  }

  // Small boost for bestsellers
  if (product.bestseller) {
    score += SCORE_WEIGHTS.bestseller;
  }
  
  return score;
}

/**
 * Gets a list of personalized product recommendations.
 * @param allProducts - The list of all available products.
 * @returns A sorted list of recommended products.
 */
export function getPersonalizedRecommendations(allProducts: Product[]): Product[] {
  const activity = getUserActivity();
  
  // If there's no activity, return bestsellers or a slice of all products
  if (
    activity.viewedProductIds.size === 0 &&
    activity.viewedCategories.size === 0 &&
    activity.searchTerms.size === 0
  ) {
    const bestsellers = allProducts.filter(p => p.bestseller);
    if (bestsellers.length > 0) return bestsellers;
    return allProducts.slice(0, 20); // Fallback to first 20 products
  }

  const scoredProducts = allProducts.map(product => ({
    product,
    score: calculateProductScore(product, activity),
  }));

  // Sort products by score in descending order
  scoredProducts.sort((a, b) => b.score - a.score);

  // Return the product objects from the sorted list, filtering out those with a score of 0
  return scoredProducts
    .filter(item => item.score > 0)
    .map(item => item.product);
}
