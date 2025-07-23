
'use client';

import { ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import Logo from './logo';
import Link from 'next/link';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { auth } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { SearchWrapper } from './search/search-wrapper';
import { CartSheet } from './cart-sheet';
import { LocationPicker } from './location-picker';

interface HeaderProps {}

export default function Header({}: HeaderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
      toast({ variant: 'destructive', title: 'Sign Out Failed', description: 'Could not sign you out. Please try again.' });
    }
  };
  
  const ProfileDropdown = (
     <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.photoURL || `https://placehold.co/100x100.png`} alt="User avatar" data-ai-hint="user avatar" />
              <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.displayName || user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/track-order')}>
            Track Orders
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm text-foreground">
      <div className="container mx-auto px-4 py-3 space-y-4">
        {/* Top Row: Logo and Location */}
        <div className="flex justify-between items-center">
            <div className='flex items-center'>
                <Link href="/">
                  <Logo />
                </Link>
                <div className="hidden md:block">
                    <LocationPicker />
                </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
                <CartSheet>
                    <Button asChild variant="ghost" size="icon">
                        <span>
                            <ShoppingCart className="w-5 h-5" />
                            <span className="sr-only">Shopping Cart</span>
                        </span>
                    </Button>
                </CartSheet>
                {user ? (
                    ProfileDropdown
                ) : (
                    <Button asChild variant="secondary">
                        <Link href="/login">Login</Link>
                    </Button>
                )}
            </div>
        </div>

        {/* Bottom Row: Search */}
        <div className="flex items-center gap-4">
          <div className="flex-grow">
            <SearchWrapper />
          </div>
        </div>
      </div>
    </header>
  );
}
