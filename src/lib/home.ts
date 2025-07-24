
import type { Product, BestsellerCategory, ShowcaseCategory } from './types';

export function getHomePageData(products: Product[]) {
  const productsByCategory: Record<string, Product[]> = {};
  const showcaseCategories: ShowcaseCategory[] = [];
  const bestsellerCategories: BestsellerCategory[] = [];
  const previewCategories: BestsellerCategory[] = [];
  
  // First, group products by category
  for (const product of products) {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
  }

  // Create showcase and preview categories from all available categories
  for (const categoryName in productsByCategory) {
    const categoryProducts = productsByCategory[categoryName];
    if (categoryProducts.length > 0) {
        showcaseCategories.push({
            name: categoryName,
            imageUrls: categoryProducts.slice(0, 5).map(p => p.imageUrl), // Get up to 5 images
        });
    }

    // Create preview categories for all categories with at least 4 products
    if (categoryProducts.length >= 4) {
      previewCategories.push({
        name: categoryName,
        images: categoryProducts.slice(0, 4).map(p => ({ src: p.imageUrl, alt: p.name })),
        totalProducts: categoryProducts.length,
      })
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
        totalProducts: categoryProducts.length,
      });
    }
  }
  
  return {
    productsByCategory,
    showcaseCategories,
    bestsellerCategories,
    previewCategories,
  };
}
