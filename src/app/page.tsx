
import Image from 'next/image';
import Header from '@/components/header';
import { BestsellerCard } from '@/components/BestsellerCard';
import { getProducts } from '@/lib/products';
import { getHomePageData } from '@/lib/home';
import type { Product, BestsellerCategory, BestsellerImage } from '@/lib/types';
import { ProductGrid } from '@/components/product-grid';
import { CategoryShowcase } from '@/components/category/CategoryShowcase';
import Footer from '@/components/footer';

// Helper function to shuffle an array
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  let currentIndex = newArray.length;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex],
      newArray[currentIndex],
    ];
  }
  return newArray;
}


export default async function Home() {
  const { products, error } = await getProducts();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md max-w-2xl">
          <h2 className="text-xl font-bold mb-2">Firestore Access Error</h2>
          <pre className="text-left bg-gray-100 p-3 rounded-md overflow-x-auto whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="p-4 text-center text-muted-foreground">
             <h2 className="text-2xl font-bold text-foreground mb-2">No Products Found</h2>
             <p>It looks like there are no products in the database yet.</p>
             <p className="mt-4 text-xs">If you have already configured your Firebase project, please add some products to the 'products' collection in Firestore.</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const { productsByCategory, showcaseCategories, bestsellerCategories } = getHomePageData(products);
  const shuffledCategoryEntries = shuffle(Object.entries(productsByCategory));

  return (
    <>
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        {showcaseCategories.length > 0 && (
            <section className="py-6">
                 <div className="px-4 mb-4">
                    <h2 className="text-2xl font-bold">Shop by Category</h2>
                 </div>
                <CategoryShowcase 
                    showcaseCategories={showcaseCategories} 
                    productsByCategory={productsByCategory}
                />
            </section>
        )}

        {bestsellerCategories.length > 0 && (
          <section className="px-4 py-4">
            <h2 className="text-2xl font-bold mb-4">Bestsellers</h2>
            <div className="grid grid-cols-2 gap-4">
              {bestsellerCategories.map((category) => (
                <BestsellerCard key={category.name} category={category} />
              ))}
            </div>
          </section>
        )}

        {shuffledCategoryEntries.map(([categoryName, productsInSection]) => (
          <section key={categoryName} className="px-4 py-4">
            <h2 className="text-2xl font-bold mb-4">{categoryName}</h2>
            <ProductGrid products={productsInSection} allProducts={products} />
          </section>
        ))}

      </main>
      <Footer />
    </>
  );
}
