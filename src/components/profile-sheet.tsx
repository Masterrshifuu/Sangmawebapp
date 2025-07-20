
'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signOut, type User as FirebaseUser } from 'firebase/auth';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from './ui/sheet';

function ProfileContent() {
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

  if (!user) return null;

  return (
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
      <DrawerFooter className="p-4 border-t bg-background mt-auto sm:mt-0 sm:border-0 sm:p-0">
        <DrawerClose asChild>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </>
  )
}

export function ProfileSheet({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return null;
  }
  
  if (isMobile === undefined) return null;

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="h-auto flex flex-col p-0">
          <DrawerHeader className="p-4 pt-0 border-b">
            <DrawerTitle className="text-center">Your Profile</DrawerTitle>
          </DrawerHeader>
          <ProfileContent />
        </DrawerContent>
      </Drawer>
    );
  }

  // Fallback to Sheet for desktop (though not currently used in header)
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-[350px] flex flex-col p-0"
        showCloseButton={true}
      >
        <SheetHeader className="p-4 pt-4 border-b">
          <SheetTitle className="text-center">Your Profile</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col justify-between flex-1">
          <ProfileContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
