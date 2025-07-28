import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {[...Array(15)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <Skeleton className="w-full aspect-square rounded-lg" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
