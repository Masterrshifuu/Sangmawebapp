'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, User, LayoutGrid } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Cart } from './cart-sheet';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { useCart } from '@/context/cart-context';

const BottomNavbar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { cartCount } = useCart();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/categories', icon: LayoutGrid, label: 'Categories' },
    { href: '/search', icon: Search, label: 'Search' },
  ];

  return (
    <div className="fixed bottom-0 w-full bg-background border-t z-40 md:hidden text-black dark:text-white">
      <div className="grid grid-cols-5 justify-items-center items-center h-14 px-2">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link href={href} key={label} aria-label={label} className="flex justify-center w-full">
            <Icon
              className={cn(
                'h-7 w-7 transition-transform',
                pathname === href && 'text-primary scale-110'
              )}
            />
          </Link>
        ))}
        
        <Cart>
          <Button variant="ghost" className="p-0 h-auto text-current relative active:bg-transparent">
            <ShoppingCart className="h-7 w-7" />
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
                </span>
            )}
            <span className="sr-only">Cart</span>
          </Button>
        </Cart>

        <Link href="/profile" aria-label="Profile" className="flex justify-center w-full">
          <Avatar className={cn('h-8 w-8', pathname === '/profile' && 'ring-2 ring-primary')}>
            <AvatarImage
              src={user?.photoURL || `https://placehold.co/100x100.png`}
              alt="User Profile"
              data-ai-hint="user avatar"
            />
            <AvatarFallback>
              {user ? (
                user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'
              ) : (
                <User className="h-5 w-5" />
              )}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavbar;
