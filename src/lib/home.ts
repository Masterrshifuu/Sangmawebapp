
'use client';
import type { Product, Category, BestsellerCategory, BestsellerImage } from './types';

function shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export function getHomePageData(products: Product[], allCategories: Category[]) {

    const productsByCategory: Record<string, Product[]> = {};
    for (const product of products) {
        if (!productsByCategory[product.category]) {
            productsByCategory[product.category] = [];
        }
        productsByCategory[product.category].push(product);
    }

    const bestsellerProducts = products.filter(p => p.bestseller);
    const bestsellerCategories: BestsellerCategory[] = [];

    const bestsellerCategoriesMap: Record<string, { id: string, images: BestsellerImage[], productCount: number }> = {};

    for (const product of bestsellerProducts) {
        if (!bestsellerCategoriesMap[product.category]) {
             const categoryDoc = allCategories.find(c => c.name === product.category);
             if (categoryDoc) {
                bestsellerCategoriesMap[product.category] = {
                    id: categoryDoc.id,
                    images: [],
                    productCount: 0,
                };
             }
        }
        if (bestsellerCategoriesMap[product.category] && bestsellerCategoriesMap[product.category].images.length < 4) {
            bestsellerCategoriesMap[product.category].images.push({ productId: product.id, imageUrl: product.imageUrl });
        }
    }
    
    for (const categoryName in bestsellerCategoriesMap) {
        const productsInCategory = productsByCategory[categoryName] || [];
        const categoryData = bestsellerCategoriesMap[categoryName];

        if(categoryData.images.length > 0) {
            bestsellerCategories.push({
                id: categoryData.id,
                name: categoryName,
                images: shuffle(categoryData.images),
                productCount: productsInCategory.length,
            });
        }
    }


    const showcaseCategories: Category[] = shuffle(allCategories).slice(0, 10);

    return { productsByCategory, showcaseCategories, bestsellerCategories: shuffle(bestsellerCategories) };
}
