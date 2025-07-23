
'use client';

import { Home, Search, ShoppingCart, User, LayoutGrid, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { AppTab } from './app-shell';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CartSheet } from './cart-sheet';

interface BottomNavbarProps {
  activeTab?: AppTab;
  setActiveTab?: (tab: AppTab) => void;
}

const BottomNavbar = ({ activeTab, setActiveTab }: BottomNavbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentTab = searchParams.get('tab') as AppTab | null;
  const isHomePage = pathname === '/' && !currentTab;

  const navItems: { path: string; tab: AppTab; icon: React.ElementType; label: string }[] = [
    { path: '/', tab: 'home', icon: Home, label: 'Home' },
    { path: '/?tab=categories', tab: 'categories', icon: LayoutGrid, label: 'Categories' },
    { path: '/?tab=search', tab: 'search', icon: Search, label: 'Search' },
    { path: '/?tab=ai-chat', tab: 'ai-chat', icon: Bot, label: 'AI Chat' },
    { path: '/?tab=account', tab: 'account', icon: User, label: 'Account' },
  ];
  
  const handleNav = (path: string) => {
      router.push(path);
  }
  
  const getIsActive = (tab: AppTab): boolean => {
    if (tab === 'home') {
      return isHomePage;
    }
    return activeTab === tab;
  }

  return (
    <div className="fixed bottom-0 w-full bg-background border-t z-40 md:hidden text-black dark:text-white">
      <div className="grid grid-cols-6 justify-items-center items-center h-14 px-2">
        {navItems.map(({ path, tab, icon: Icon, label }) => (
          <Button
            key={tab}
            variant="ghost"
            className="flex flex-col items-center justify-center w-full h-full p-0"
            onClick={() => handleNav(path)}
            aria-label={label}
          >
            <Icon
              className={cn(
                'h-6 w-6 transition-transform text-muted-foreground',
                getIsActive(tab) && 'text-primary scale-110'
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
