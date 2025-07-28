
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { auth, googleProvider, appleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/'); // Redirect to home if already logged in
    }
  }, [user, loading, router]);

  const handleSignIn = async (provider: typeof googleProvider | typeof appleProvider) => {
    try {
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener in useAuth will handle the redirect
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  if (loading || user) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-pulse">
                <Logo />
            </div>
        </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
      <div className="max-w-md w-full text-center">
        <Logo className="justify-center mb-8" />
        <h1 className="text-2xl font-bold font-headline mb-2">Welcome!</h1>
        <p className="text-muted-foreground mb-8">Sign in or create an account to continue.</p>
        <div className="space-y-4">
            <Button className="w-full" size="lg" onClick={() => handleSignIn(googleProvider)}>
                <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 60.4L337.9 162.6C301.6 129.1 270.8 112 248 112c-88.3 0-160 71.7-160 160s71.7 160 160 160c92.6 0 156.6-63.3 162.7-149.5H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                Continue with Google
            </Button>
            <Button className="w-full" size="lg" onClick={() => handleSignIn(appleProvider)} variant="secondary">
                <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="apple" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C39.2 141.6 0 184.2 0 241.2c0 61.6 31.5 112.9 80.9 142.8 28.8 17.5 60.8 26.9 96.4 26.9 23.3 0 45.9-7.5 64.9-22.1 34.4-25.9 50.7-65.7 51.2-66.2zM215.3 83.1c-19.4-19.4-44.9-31.5-70.1-31.5-26.9 0-52.9 10.7-71.5 31.5-17.5 19.4-29.7 44.9-31.5 70.1-2.8 35.5 19.7 74.3 19.7 88.5 0 15 19.7 49.4 19.7 76.4 19.4 19.4 44.9 31.5 70.1 31.5 26.9 0 52.9-10.7 71.5-31.5 17.5-19.4 29.7-44.9 31.5-70.1 2.8-35.5-19.7-74.3-19.7-88.5 0-15-19.7-49.4-19.7-76.4z"></path></svg>
                Continue with Apple
            </Button>
        </div>
      </div>
    </main>
  );
}
