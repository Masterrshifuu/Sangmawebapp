
import type { Product, BestsellerCategory, ShowcaseCategory } from './types';

export function getHomePageData(products: Product[]) {
  const productsByCategory: Record<string, Product[]> = {};
  const showcaseCategories: ShowcaseCategory[] = [];
  const bestsellerCategories: BestsellerCategory[] = [];
  const categoryImages: Record<string, string> = {};

  // First, group products by category
  for (const product of products) {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
    
    // Capture the first image for each category to use as a showcase image
    if (!categoryImages[product.category]) {
        categoryImages[product.category] = product.imageUrl;
    }
  }

  // Create showcase categories from all available categories
  for (const categoryName in productsByCategory) {
    if (categoryImages[categoryName]) {
        showcaseCategories.push({
            name: categoryName,
            imageUrl: categoryImages[categoryName],
        });
    }
  }

  // Identify bestseller products and group them by category
  const bestsellerProducts = products.filter(p => p.isBestseller);
  const bestsellersByCategory: Record<string, Product[]> = {};
  for (const product of bestsellerProducts) {
    if (!bestsellersByCategory[product.category]) {
      bestsellersByCategory[product.category] = [];
    }
    bestsellersByCategory[product.category].push(product);
  }

  // Create bestseller category objects for the UI
  for (const categoryName in bestsellersByCategory) {
    const categoryProducts = bestsellersByCategory[categoryName];
    if (categoryProducts.length > 0) {
      bestsellerCategories.push({
        name: categoryName,
        images: categoryProducts.slice(0, 4).map(p => ({ src: p.imageUrl, alt: p.name })),
      });
    }
  }

  return {
    productsByCategory,
    showcaseCategories,
    bestsellerCategories,
  };
}
