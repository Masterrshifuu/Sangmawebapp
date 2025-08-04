
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CartItem } from '@/lib/types';
import { CartQuantityControl } from './CartQuantityControl';

export function CartItemCard({ item }: { item: CartItem }) {
  const price = item.product.mrp || 0;
  
  return (
    <div className="flex items-start gap-4">
      <Link href={`/product/${item.product.id}`}>
        <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted/40 flex-shrink-0">
          <Image
            src={item.product.imageUrl}
            alt={item.product.name}
            fill
            className="object-contain"
            sizes="20vw"
          />
        </div>
      </Link>
      <div className="flex-1">
        <Link href={`/product/${item.product.id}`}>
            <p className="font-semibold hover:underline text-sm leading-tight">{item.product.name}</p>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">₹{price.toFixed(2)}</p>
        <div className="mt-2 w-28">
            <CartQuantityControl product={item.product} />
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <p className="font-bold text-sm">₹{(price * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  );
}
