'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

// This is a client-side component that runs on initial load.
// Its sole purpose is to check if the current URL is a Firebase email sign-in link.
export default function EmailSignInHandler() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check if the current URL is a sign-in link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      // Get the email from localStorage
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        // If the email is not in localStorage, prompt the user for it.
        // This can happen if they open the link on a different device.
        email = window.prompt('Please provide your email for confirmation');
      }

      if (email) {
        // Now, sign the user in
        signInWithEmailLink(auth, email, window.location.href)
          .then((result) => {
            // Clear the email from localStorage
            window.localStorage.removeItem('emailForSignIn');
            
            toast({
              title: 'Success!',
              description: 'You have been successfully signed in.',
            });
            // Redirect to a protected page, e.g., profile
            router.push('/profile');
          })
          .catch((error) => {
            console.error('Email link sign-in error:', error);
            toast({
              variant: 'destructive',
              title: 'Sign-in Error',
              description: 'The sign-in link is invalid or has expired.',
            });
            router.push('/login');
          });
      }
    }
  }, [router, toast]);

  // This component renders nothing itself.
  return null;
}
