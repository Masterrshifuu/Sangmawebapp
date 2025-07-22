
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page now redirects to the home page with the correct tab selected.
export default function SearchRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/?tab=search');
  }, [router]);

  return null; // Render nothing while redirecting
}
