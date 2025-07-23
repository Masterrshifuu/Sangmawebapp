
'use client';

import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';

export function CartQuantityControl({ product }: { product: Product }) {
  const { cart, updateQuantity, removeItem } = useCart();
  const cartItem = cart.find(item => item.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  if (quantity === 0) return null;

  return (
    <div className="flex items-center justify-center rounded-md border">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => quantity === 1 ? removeItem(product.id) : updateQuantity(product.id, quantity - 1)}
      >
        {quantity === 1 ? <Trash2 className="w-4 h-4 text-destructive" /> : <Minus className="w-4 h-4" />}
      </Button>
      <span className="w-6 text-center text-sm font-medium">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => updateQuantity(product.id, quantity + 1)}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
