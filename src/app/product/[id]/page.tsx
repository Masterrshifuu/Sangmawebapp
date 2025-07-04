
import { getProducts } from "@/lib/data";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartSection } from "@/components/add-to-cart-section";
import SimilarProducts from "@/components/similar-products";
import { Badge } from "@/components/ui/badge";
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const products = await getProducts();
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    }
  }

  return {
    title: `${product.name} - Sangma Megha Mart`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: Props) {
  const products = await getProducts();
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  const similarProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint="product image"
          />
          <Badge variant="secondary" className="absolute top-4 left-4 bg-accent text-accent-foreground">
            Instant Delivery
          </Badge>
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold">INR {product.price.toFixed(2)}</span>
          </div>
          <AddToCartSection product={product} />
        </div>
      </div>
      <SimilarProducts products={similarProducts} />
    </div>
  );
}
