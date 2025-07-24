
import type { Product, BestsellerCategory, ShowcaseCategory } from './types';

export function getHomePageData(products: Product[]) {
  const productsByCategory: Record<string, Product[]> = {};
  const showcaseCategories: ShowcaseCategory[] = [];
  
  // First, group products by category
  for (const product of products) {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
  }

  // Create showcase categories from all available categories
  for (const categoryName in productsByCategory) {
    const categoryProducts = productsByCategory[categoryName];
    if (categoryProducts.length > 0) {
        showcaseCategories.push({
            name: categoryName,
            imageUrls: categoryProducts.slice(0, 5).map(p => p.imageUrl), // Get up to 5 images
        });
    }
  }
  
  return {
    showcaseCategories,
  };
}
