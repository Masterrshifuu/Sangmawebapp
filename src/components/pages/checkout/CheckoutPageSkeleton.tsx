
import { Skeleton } from "@/components/ui/skeleton"

export const CheckoutPageSkeleton = () => (
    <div className="animate-pulse space-y-8 p-4">
        <div className="space-y-2">
            <Skeleton className="h-8 w-1/2 bg-muted rounded" />
            <Skeleton className="h-4 w-1/3 bg-muted rounded" />
        </div>
        <Skeleton className="h-64 w-full bg-muted rounded-lg" />
        <Skeleton className="h-48 w-full bg-muted rounded-lg" />
    </div>
)
