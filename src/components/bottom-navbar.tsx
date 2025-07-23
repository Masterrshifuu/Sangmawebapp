
'use client';

import { Home, Search, ShoppingCart, User, LayoutGrid, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { AppTab } from './app-shell';
import { useRouter } from 'next/navigation';
import { CartSheet } from './cart-sheet';

interface BottomNavbarProps {
  activeTab?: AppTab;
  setActiveTab?: (tab: AppTab) => void;
}

const BottomNavbar = ({ activeTab, setActiveTab }: BottomNavbarProps) => {
  const router = useRouter();

  const navItems: { tab: AppTab; icon: React.ElementType; label: string }[] = [
    { tab: 'home', icon: Home, label: 'Home' },
    { tab: 'categories', icon: LayoutGrid, label: 'Categories' },
    { tab: 'search', icon: Search, label: 'Search' },
    { tab: 'ai-chat', icon: Bot, label: 'AI Chat' },
    { tab: 'account', icon: User, label: 'Account' },
  ];
  
  const handleNav = (tab: AppTab) => {
    if (setActiveTab) {
      setActiveTab(tab);
    } else {
      router.push(`/?tab=${tab}`);
    }
  }

  return (
    <div className="fixed bottom-0 w-full bg-background border-t z-40 md:hidden text-black dark:text-white">
      <div className="grid grid-cols-6 justify-items-center items-center h-14 px-2">
        {navItems.map(({ tab, icon: Icon, label }) => (
          <Button
            key={tab}
            variant="ghost"
            className="flex flex-col items-center justify-center w-full h-full p-0"
            onClick={() => handleNav(tab)}
            aria-label={label}
          >
            <Icon
              className={cn(
                'h-6 w-6 transition-transform text-muted-foreground',
                activeTab === tab && 'text-primary scale-110'
              )}
            />
          </Button>
        ))}
        
        <CartSheet>
            <Button variant="ghost" className="flex flex-col items-center justify-center w-full h-full p-0 relative">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                <span className="sr-only">Cart</span>
            </Button>
        </CartSheet>
      </div>
    </div>
  );
};

export default BottomNavbar;
