
'use client'

import { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

export default function SimilarProducts({ products }: { products: Product[] }) {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4 font-headline">Similar Items</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    )
}
