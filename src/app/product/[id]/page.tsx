'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProductPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page, since product details are now a sheet
    router.replace('/');
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Loader2 className="h-12 w-12 animate-spin" />
    </div>
  );
}
