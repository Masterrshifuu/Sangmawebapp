
import SearchHeader from '@/components/SearchHeader';
import { Skeleton } from '@/components/ui/skeleton';

export const ProductPageSkeleton = () => (
    <>
        <SearchHeader />
        <main className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <Skeleton className="w-full aspect-square rounded-lg" />
                    <div className="mt-4 grid grid-cols-5 gap-4">
                        <Skeleton className="w-full aspect-square rounded-md" />
                        <Skeleton className="w-full aspect-square rounded-md" />
                        <Skeleton className="w-full aspect-square rounded-md" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-20 w-full" />
                    <div className="flex justify-between items-center pt-4">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-12 w-36 rounded-lg" />
                    </div>
                </div>
            </div>
        </main>
    </>
);
