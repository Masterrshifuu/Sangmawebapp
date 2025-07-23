
import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';

export function ProductGrid({ products, allProducts }: { products: Product[], allProducts: Product[] }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}
