
import { notFound } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/products';
import { getReviews } from '@/lib/reviews';

import Header from '@/components/header';
import { ProductClientPage } from '@/components/pages/product/ProductClientPage';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const id = params.id;
  
  if (!id) {
    notFound();
  }

  // Fetch product data, reviews, and all products for "similar" section in parallel
  const [
    { product, error },
    reviews,
    { products: allProducts }
  ] = await Promise.all([
    getProductById(id),
    getReviews(id),
    getProducts()
  ]);

  if (error || !product) {
    notFound();
  }

  const similarProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 10);

  const featuredProducts = allProducts.filter(p => p.isBestseller);
  const recommendedProducts = allProducts.filter(p => p.id !== product.id).sort(() => 0.5 - Math.random()).slice(0, 10);
  
  return (
    <>
      <Header />
      <ProductClientPage
        product={product}
        initialReviews={reviews}
        similarProducts={similarProducts}
        featuredProducts={featuredProducts}
        recommendedProducts={recommendedProducts}
      />
    </>
  );
}
