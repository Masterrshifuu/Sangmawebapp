
import Header from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';

export const AccountPageSkeleton = () => (
    <>
        <Header />
        <main className="flex-1 pb-16 md:pb-0">
             <div className="p-6 bg-accent/20">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32 rounded" />
                        <Skeleton className="h-4 w-48 rounded" />
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-24 rounded" />
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full rounded-lg" />
                            <Skeleton className="h-12 w-full rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </main>
    </>
);
