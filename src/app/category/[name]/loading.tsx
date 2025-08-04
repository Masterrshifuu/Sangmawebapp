
import SearchHeader from '@/components/SearchHeader';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <>
      <SearchHeader />
      <main className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-lg overflow-hidden shadow-md flex flex-col h-full"
            >
              <Skeleton className="w-full aspect-[4/3]" />
              <div className="p-3 flex flex-col flex-grow">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/4 mb-4" />
                <div className="mt-auto flex justify-between items-end">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-9 w-20 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
