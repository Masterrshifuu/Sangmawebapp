
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    // This check runs only on the client-side.
    if (sessionStorage.getItem('skippedLogin') === 'true') {
      setIsAuthenticating(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If a user is found, they are authenticated.
        // We can remove the flag as it's no longer needed.
        sessionStorage.removeItem('skippedLogin');
        setIsAuthenticating(false);
      } else {
        // If no user is found and they haven't skipped, redirect to login.
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isAuthenticating) {
    return (
      <div className="container mx-auto flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
