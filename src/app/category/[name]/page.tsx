
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/products';
import Header from '@/components/header';
import { ProductCard } from '@/components/product-card';
import type { Metadata } from 'next';

function decodeCategoryName(slug: string): string {
    return decodeURIComponent(slug).replace(/-and-/g, ' & ');
}

function capitalizeWords(name: string): string {
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default async function CategoryPage({ params }: { params: { name: string } }) {
    const categoryNameSlug = params.name;

    if (!categoryNameSlug) {
        notFound();
    }
    
    const { products } = await getProducts();
    
    // Decode the slug back to the original category name format for filtering
    const categoryName = decodeCategoryName(categoryNameSlug);
    // Capitalize first letter of each word for display
    const displayCategoryName = capitalizeWords(categoryName);

    const categoryProducts = products.filter(p => p.category.toLowerCase() === categoryName.toLowerCase());

    if (categoryProducts.length === 0) {
        const categoryExists = products.some(p => p.category.toLowerCase() === categoryName.toLowerCase());
        if (!categoryExists) {
             notFound();
        }
    }

    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold font-headline mb-6">{displayCategoryName}</h1>
                {categoryProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {categoryProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground">No products found in this category yet.</p>
                    </div>
                )}
            </main>
        </>
    )
}
