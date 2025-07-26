
'use client';
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Product } from "@/lib/types";
import { useCart } from "@/hooks/use-cart";
import { Plus } from "lucide-react";
import { CartQuantityControl } from "./cart/CartQuantityControl";

export function ProductCard({ product }: { product: Product }) {
    const { cart, addItem } = useCart();
    const cartItem = cart.find(item => item.product.id === product.id);

    return (
        <div className="bg-card rounded-lg overflow-hidden shadow-md flex flex-col h-full group transition-shadow duration-300 hover:shadow-xl">
            <Link href={`/product/${product.id}`} className="block">
                <div className="relative w-full aspect-[4/3] bg-muted/30">
                    <Image
                        src={product.imageUrl || `https://placehold.co/400x300.png`}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                </div>
            </Link>
            <div className="p-3 flex flex-col flex-grow">
                <Link href={`/product/${product.id}`} className="block">
                    <h3 className="font-semibold text-sm leading-tight truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{product.description}</p>
                </Link>
                
                <div className="mt-auto pt-3 flex justify-between items-end">
                    <div>
                        {typeof product.mrp === 'number' && (
                            <p className="font-bold text-base">INR {product.mrp.toFixed(2)}</p>
                        )}
                    </div>
                    
                    <div className="w-24">
                        {cartItem ? (
                           <CartQuantityControl product={product} />
                        ) : (
                            <Button variant="secondary" size="sm" className="w-full bg-accent hover:bg-accent/80 text-accent-foreground border-transparent shadow-md active:scale-95 transition-transform duration-75" onClick={() => addItem(product)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
