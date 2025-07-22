'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page now redirects to the home page with a query param
// to open the categories tab in the new AppShell.
export default function CategoriesRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/?tab=categories');
  }, [router]);

  return null; // Or a loading spinner
}
