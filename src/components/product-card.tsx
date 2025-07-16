'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { type Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { QuantitySelector } from './quantity-selector';
import { useState, useEffect } from 'react';

type ProductCardProps = {
  product: Product;
  size?: 'default' | 'small';
  onProductClick?: () => void;
  imageUrls?: string[];
};

export default function ProductCard({
  product,
  size = 'default',
  onProductClick,
  imageUrls = [],
}: ProductCardProps) {
  const { addToCart, removeFromCart, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  const isSmall = size === 'small';
  const displayImageUrls = imageUrls.length > 0 ? imageUrls : [product.imageUrl];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (displayImageUrls.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % displayImageUrls.length);
    }, 3000 + Math.random() * 1000); 

    return () => clearInterval(interval);
  }, [displayImageUrls.length]);

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/product/${product.id}`}
        onClick={onProductClick}
        className="flex flex-col flex-grow"
      >
        <CardHeader className="p-0 relative">
          <div className="aspect-square w-full relative overflow-hidden">
             <div 
              className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {displayImageUrls.map((url, index) => (
                <div key={`${url}-${index}`} className="absolute top-0 left-0 w-full h-full flex-shrink-0" style={{ transform: `translateX(${index * 100}%)` }}>
                    <Image
                        src={url}
                        alt={`${product.name} - image ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-contain p-2"
                        data-ai-hint="product image"
                    />
                </div>
              ))}
            </div>
          </div>
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs"
          >
            Instant Delivery
          </Badge>
        </CardHeader>
        <CardContent className={cn('flex-grow', isSmall ? 'p-2' : 'p-4')}>
          <CardTitle
            className={cn(
              'font-bold font-headline leading-tight mb-1 truncate',
              isSmall ? 'text-sm' : 'text-base'
            )}
          >
            {product.name}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </CardDescription>
        </CardContent>
      </Link>
      <CardFooter
        className={cn(
          'flex justify-between items-center pt-0 mt-auto',
          isSmall ? 'p-2' : 'p-4'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={cn('font-bold', isSmall ? 'text-base' : 'text-lg')}>
          INR {product.price.toFixed(2)}
        </p>
        {quantity > 0 ? (
          <QuantitySelector
            quantity={quantity}
            onIncrease={() => addToCart(product)}
            onDecrease={() => removeFromCart(product.id)}
            size={isSmall ? 'small' : 'default'}
          />
        ) : (
          <Button size="sm" onClick={() => addToCart(product)}>
            Add
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
