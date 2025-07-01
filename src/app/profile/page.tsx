'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { User, LogOut, Loader2 } from "lucide-react";
import type { Metadata } from 'next';

// Metadata can't be used in client components, but we'll leave this for reference
// export const metadata: Metadata = {
//   title: 'Profile - Sangma Megha Mart',
//   description: 'Your user profile.',
// };

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // This part should ideally not be reached due to the redirect, but it's good practice
    return null;
  }
  
  const getInitials = (emailOrPhone: string | null | undefined) => {
    if (!emailOrPhone) return 'U';
    const namePart = emailOrPhone.split('@')[0];
    return namePart.substring(0, 2).toUpperCase();
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.photoURL || `https://placehold.co/100x100.png`} alt="User Profile" data-ai-hint="user avatar" />
                <AvatarFallback>
                    {user.email || user.phoneNumber ? getInitials(user.email || user.phoneNumber) : <User className="h-12 w-12" />}
                </AvatarFallback>
            </Avatar>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground space-y-2">
            <p>Welcome back!</p>
            {user.email && <p><strong>Email:</strong> {user.email}</p>}
            {user.phoneNumber && <p><strong>Phone:</strong> {user.phoneNumber}</p>}
          </div>
        </CardContent>
        <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4"/>
                Sign Out
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
