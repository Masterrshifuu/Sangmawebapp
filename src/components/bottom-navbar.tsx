'use client';

import Link from 'next/link';
import { Home, Search, Bot, ShoppingCart, User } from 'lucide-react';
import SearchSheet from './search-sheet';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { CartSheet } from './cart-sheet';
import AiChatSheet from './ai-chat-sheet';
import { ProfileSheet } from './profile-sheet';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';

const BottomNavbar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<FirebaseUser | null>(null);

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
      <div className="flex justify-around items-center h-14 px-2">
        <Link href="/" aria-label="Home">
          <Home
            className={cn(
              'h-7 w-7 transition-transform',
              pathname === '/' && 'scale-110'
            )}
          />
        </Link>

        <SearchSheet>
          <Button
            variant="ghost"
            className="p-0 h-auto text-current hover:bg-transparent"
          >
            <Search className="h-7 w-7" />
            <span className="sr-only">Search</span>
          </Button>
        </SearchSheet>

        <AiChatSheet>
          <Button
            variant="ghost"
            className="p-0 h-auto text-current hover:bg-transparent"
            aria-label="AI Chat"
          >
            <Bot className="h-7 w-7" />
          </Button>
        </AiChatSheet>

        <CartSheet>
          <Button
            variant="ghost"
            className="p-0 h-auto text-current hover:bg-transparent"
            aria-label="Cart"
          >
            <ShoppingCart className="h-7 w-7" />
            <span className="sr-only">Cart</span>
          </Button>
        </CartSheet>

        {user ? (
          <ProfileSheet>{ProfileTrigger}</ProfileSheet>
        ) : (
          <Link href="/login" aria-label="Profile">
            {ProfileTrigger}
          </Link>
        )}
      </div>
    </footer>
  );
};

export default BottomNavbar;
