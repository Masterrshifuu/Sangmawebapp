
import SearchHeader from '@/components/SearchHeader';
import { Skeleton } from '@/components/ui/skeleton';

export const HomePageSkeleton = () => (
    <>
        <SearchHeader />
        <main className="flex-1 pb-16 md:pb-0 py-6 space-y-8">
            <section>
                <Skeleton className="h-8 w-48 mb-4 ml-4" />
                <div className="flex gap-4 overflow-x-auto pb-4 px-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center space-y-2 flex-shrink-0">
                            <Skeleton className="w-20 h-20 rounded-lg" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </section>
             <section>
                <Skeleton className="h-8 w-32 mb-4 ml-4" />
                <div className="flex gap-4 overflow-x-auto pb-4 px-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="w-80 h-72 rounded-lg flex-shrink-0" />
                    ))}
                </div>
            </section>
        </main>
    </>
);
