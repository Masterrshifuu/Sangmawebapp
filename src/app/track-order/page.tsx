'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page now redirects to the home page with a query param
// to open the account tab in the new AppShell.
export default function TrackOrderRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/?tab=account');
  }, [router]);

  return null; // Or a loading spinner
}
