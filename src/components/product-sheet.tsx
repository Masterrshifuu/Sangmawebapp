'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { AddToCartSection } from '@/components/add-to-cart-section';
import SimilarProducts from '@/components/similar-products';
import type { Product } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

interface ProductSheetProps {
  product: Product | null;
  similarProducts: Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductSelect: (product: Product) => void;
}

export function ProductSheet({
  product,
  similarProducts,
  open,
  onOpenChange,
  onProductSelect,
}: ProductSheetProps) {
  if (!product) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] flex flex-col p-0 rounded-t-2xl"
        showCloseButton={false}
      >
        <div className="flex justify-center py-3">
          <SheetClose>
            <div className="w-12 h-1.5 rounded-full bg-muted" />
          </SheetClose>
        </div>
        <SheetHeader className="px-4 pb-4 text-left">
          <SheetTitle className="font-headline text-2xl truncate">
            {product.name}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="container mx-auto px-4 pb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  data-ai-hint="product image"
                />
                <Badge
                  variant="secondary"
                  className="absolute top-4 left-4 bg-accent text-accent-foreground"
                >
                  Instant Delivery
                </Badge>
              </div>

              <div className="flex flex-col justify-start space-y-6 pt-4 md:pt-0">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-bold">
                    INR {product.price.toFixed(2)}
                  </span>
                </div>
                <AddToCartSection product={product} />
              </div>
            </div>
            <SimilarProducts
              products={similarProducts}
              onProductClick={onProductSelect}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
