
'use client';

import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/quantity-selector";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/lib/types";

export function AddToCartSection({ product }: { product: Product }) {
  const { addToCart, removeFromCart, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  return (
    <div className="flex items-center gap-4">
      {quantity > 0 ? (
        <QuantitySelector
          quantity={quantity}
          onIncrease={() => addToCart(product)}
          onDecrease={() => removeFromCart(product.id)}
          size="default"
        />
      ) : (
        <Button size="lg" onClick={() => addToCart(product)}>
          Add to Cart
        </Button>
      )}
    </div>
  );
}
