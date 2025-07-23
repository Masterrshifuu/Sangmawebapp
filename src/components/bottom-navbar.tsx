
'use client';

import { Home, Search, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { CartSheet } from './cart-sheet';
import { useSearchContext } from '@/context/search-context';

const BottomNavbar = () => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { setOpen } = useSearchContext();

  return (
    <div className="fixed bottom-0 w-full bg-background border-t z-40 md:hidden text-black dark:text-white">
      <div className="grid grid-cols-3 justify-items-center items-center h-14 px-2">
        <Button
          variant="ghost"
          className="flex flex-col items-center justify-center w-full h-full p-0"
          onClick={() => window.location.href = '/'}
          aria-label="Home"
        >
          <Home
            className={cn(
              'h-6 w-6 transition-transform text-muted-foreground',
              isHomePage && 'text-primary scale-110'
            )}
          />
        </Button>
        
        <Button
          variant="ghost"
          className="flex flex-col items-center justify-center w-full h-full p-0"
          onClick={() => setOpen(true)}
          aria-label="Search"
        >
          <Search className="h-6 w-6 text-muted-foreground" />
        </Button>
        
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
