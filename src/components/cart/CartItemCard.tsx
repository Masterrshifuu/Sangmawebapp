
'use client';

import Image from 'next/image';
import { CartItem } from '@/lib/types';
import { CartQuantityControl } from './CartQuantityControl';

export function CartItemCard({ item }: { item: CartItem }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted/40">
        <Image
          src={item.product.imageUrl}
          alt={item.product.name}
          fill
          className="object-contain"
          sizes="20vw"
        />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{item.product.name}</p>
        <p className="text-sm text-muted-foreground">₹{item.product.price.toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <p className="font-bold">₹{(item.product.price * item.quantity).toFixed(2)}</p>
        <div className="w-24">
            <CartQuantityControl product={item.product} />
        </div>
      </div>
    </div>
  );
}
