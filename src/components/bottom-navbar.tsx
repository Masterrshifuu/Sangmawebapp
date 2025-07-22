
'use client';

import { Home, Search, ShoppingCart, User, LayoutGrid, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Cart } from './cart-sheet';
import { ProfileSheet } from './profile-sheet';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { useCart } from '@/context/cart-context';
import type { AppTab } from './app-shell';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BottomNavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const BottomNavbar = ({ activeTab, setActiveTab }: BottomNavbarProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { cartCount } = useCart();
  const router = useRouter();


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const handleProfileClick = () => {
    // For now, the profile is a sheet, not a main tab, so it doesn't use setActiveTab
    // This can be extended if profile becomes a main tab.
  }

  const navItems: { id: AppTab; icon: React.ElementType }[] = [
    { id: 'home', icon: Home },
    { id: 'categories', icon: LayoutGrid },
    { id: 'search', icon: Search },
    { id: 'ai-chat', icon: Bot },
  ];
  
  const ProfileTrigger = (
    <div className="flex justify-center w-full">
      <Avatar className={cn('h-8 w-8 transition-transform', activeTab === 'account' && 'scale-110 ring-2 ring-primary')}>
        <AvatarImage
          src={user?.photoURL || `https://placehold.co/100x100.png`}
          alt="User Profile"
          data-ai-hint="user avatar"
        />
        <AvatarFallback>
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
    </div>
  );

  return (
    <div className="fixed bottom-0 w-full bg-background border-t z-40 md:hidden text-black dark:text-white">
      <div className="grid grid-cols-5 justify-items-center items-center h-14 px-2">
        {navItems.map(({ id, icon: Icon }) => (
          <Button
            key={id}
            variant="ghost"
            className="p-0 h-auto w-full text-current hover:bg-transparent flex justify-center"
            aria-label={id}
            onClick={() => setActiveTab(id)}
          >
            <Icon
              className={cn(
                'h-7 w-7 transition-transform',
                activeTab === id && 'scale-110 text-primary'
              )}
            />
          </Button>
        ))}

        {user ? (
           <Button
            variant="ghost"
            className="p-0 h-auto w-full text-current hover:bg-transparent flex justify-center"
            aria-label="account"
            onClick={() => setActiveTab('account')}
          >
            <Avatar className={cn('h-8 w-8 transition-transform', activeTab === 'account' && 'scale-110 ring-2 ring-primary')}>
              <AvatarImage
                src={user?.photoURL || `https://placehold.co/100x100.png`}
                alt="User Profile"
                data-ai-hint="user avatar"
              />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </Button>
        ) : (
          <Link href="/login" aria-label="Profile" className="flex justify-center w-full">
             <Avatar className="h-8 w-8">
              <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
             </Avatar>
          </Link>
        )}
      </div>
    </div>
  );
};

export default BottomNavbar;
