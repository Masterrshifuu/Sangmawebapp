'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signOut, type User as FirebaseUser } from 'firebase/auth';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

export function ProfileSheet({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const getInitials = (emailOrPhone: string | null | undefined) => {
    if (!emailOrPhone) return 'U';
    const namePart = emailOrPhone.split('@')[0];
    return namePart.substring(0, 2).toUpperCase();
  };

  if (!user) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-auto flex flex-col p-0 rounded-t-2xl"
        showCloseButton={false}
      >
        <div className="flex justify-center py-3">
          <SheetClose>
            <div className="w-12 h-1.5 rounded-full bg-muted" />
          </SheetClose>
        </div>
        <SheetHeader className="p-4 pt-0 border-b">
          <SheetTitle className="text-center">Your Profile</SheetTitle>
        </SheetHeader>

        <>
          <div className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage
                src={user.photoURL || `https://placehold.co/100x100.png`}
                alt="User Profile"
                data-ai-hint="user avatar"
              />
              <AvatarFallback>
                {user.email || user.phoneNumber ? (
                  getInitials(user.email || user.phoneNumber)
                ) : (
                  <User className="h-12 w-12" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="text-muted-foreground space-y-2">
              <p>Welcome back!</p>
              {user.email && (
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
              )}
              {user.phoneNumber && (
                <p>
                  <strong>Phone:</strong> {user.phoneNumber}
                </p>
              )}
            </div>
          </div>
          <SheetFooter className="p-4 border-t bg-background mt-auto">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </SheetFooter>
        </>
      </SheetContent>
    </Sheet>
  );
}
