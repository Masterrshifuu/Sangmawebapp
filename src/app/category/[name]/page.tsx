
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/products';
import Header from '@/components/header';
import { ProductCard } from '@/components/product-card';

export default async function CategoryPage({ params }: { params: { name: string } }) {
    const categoryNameSlug = params.name;

    if (!categoryNameSlug) {
        notFound();
    }
    
    const { products } = await getProducts();
    
    // Decode the slug back to the original category name format for filtering
    const decodedSlug = decodeURIComponent(categoryNameSlug);
    const categoryName = decodedSlug.replace(/-and-/g, ' & ');
    // Capitalize first letter of each word for display
    const displayCategoryName = categoryName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

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

// Generate static paths for categories to improve build times and performance
export async function generateStaticParams() {
    const { products } = await getProducts();

    const categoryNames = new Set(products.map(p => p.category));

    return Array.from(categoryNames).map(name => ({
        name: encodeURIComponent(name.toLowerCase().replace(/ & /g, '-and-')),
    }));
}
