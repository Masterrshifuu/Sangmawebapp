
import { notFound } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/products';
import { getReviews } from '@/lib/reviews';
import type { Metadata } from 'next';

import Header from '@/components/header';
import { ProductClientPage } from '@/components/pages/product/ProductClientPage';

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  const { product } = await getProductById(id);

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: product.name,
    description: `Order ${product.name} online from Sangma Megha Mart. ${product.description}`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.imageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
  }
}

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

// Generate static paths for products to improve build times and performance
export async function generateStaticParams() {
    const { products } = await getProducts();

    return products.map(product => ({
        id: product.id,
    }));
}
