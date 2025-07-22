
'use client';

import { Home, Search, ShoppingCart, User, LayoutGrid, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import type { AppTab } from './app-shell';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BottomNavbarProps {
  activeTab?: AppTab;
  setActiveTab?: (tab: AppTab) => void;
}

const BottomNavbar = ({ activeTab, setActiveTab }: BottomNavbarProps) => {
  const { cartCount } = useCart();
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
                'h-6 w-6 transition-transform',
                activeTab === tab && 'text-primary scale-110'
              )}
            />
          </Button>
        ))}
        
        <Link href="/cart" aria-label="Cart" className="flex justify-center items-center w-full h-full relative">
            <ShoppingCart className={cn('h-6 w-6')} />
            {cartCount > 0 && (
                <span className="absolute -top-1 right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
                </span>
            )}
        </Link>
      </div>
    </div>
  );
};

export default BottomNavbar;
