
'use client';

import Link from 'next/link';
import { Home, Search, ShoppingCart, User, LayoutGrid } from 'lucide-react';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Cart } from './cart-sheet';
import { ProfileSheet } from './profile-sheet';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { useCart } from '@/context/cart-context';
import { SearchWrapper } from './search/search-wrapper';

const BottomNavbar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { cartCount } = useCart();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const ProfileTrigger = (
    <Avatar className={cn('h-8 w-8 transition-transform')}>
      <AvatarImage
        src={user?.photoURL || `https://placehold.co/100x100.png`}
        alt="User Profile"
        data-ai-hint="user avatar"
      />
      <AvatarFallback>
        <User className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  );

  return (
    <footer className="fixed bottom-0 w-full bg-background border-t z-40 md:hidden text-black dark:text-white">
      <div className="grid grid-cols-5 justify-items-center items-center h-14 px-2">
        <Link href="/" aria-label="Home" className="flex justify-center w-full">
          <Home
            className={cn(
              'h-7 w-7 transition-transform',
              pathname === '/' && 'scale-110'
            )}
          />
        </Link>
        
        <Link href="/categories" aria-label="Categories" className="flex justify-center w-full">
          <LayoutGrid
            className={cn(
              'h-7 w-7 transition-transform',
              pathname === '/categories' && 'scale-110'
            )}
          />
        </Link>

        <SearchWrapper isBottomNav={true} />

        <Cart>
          <Button
            variant="ghost"
            className="p-0 h-auto text-current hover:bg-transparent relative"
            aria-label="Cart"
          >
            <ShoppingCart className="h-7 w-7" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="sr-only">Cart</span>
          </Button>
        </Cart>

        {user ? (
          <div className="flex justify-center w-full">
            <ProfileSheet>{ProfileTrigger}</ProfileSheet>
          </div>
        ) : (
          <Link href="/login" aria-label="Profile" className="flex justify-center w-full">
            {ProfileTrigger}
          </Link>
        )}
      </div>
    </footer>
  );
};

export default BottomNavbar;
