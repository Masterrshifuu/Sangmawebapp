
import { Skeleton } from "@/components/ui/skeleton";

export const OrdersSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border">
                <div className="p-4 border-b">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex gap-4">
                        <Skeleton className="h-14 w-14 rounded-md" />
                        <div className="flex-1 space-y-2">
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-1/4" />
                        </div>
                    </div>
                     <div className="flex gap-4">
                        <Skeleton className="h-14 w-14 rounded-md" />
                        <div className="flex-1 space-y-2">
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-1/4" />
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);
