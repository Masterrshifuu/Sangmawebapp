
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PackageSearch, LayoutGrid, User, Sparkles, ShoppingCart } from 'lucide-react';

import { cn } from '@/lib/utils';
import { AiChatSheet } from './AiChatSheet';
import { CartSheet } from './CartSheet';
import { useCart } from '@/hooks/use-cart';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/track-order', label: 'Tracking', icon: PackageSearch },
  { label: 'AI Chat', icon: Sparkles, component: AiChatSheet },
  { label: 'Cart', icon: ShoppingCart, component: CartSheet },
  { href: '/account', label: 'Account', icon: User },
];

export function BottomNavbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50 md:hidden">
      <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)`}}>
        {navItems.map((item) => {
          const isActive = item.href === pathname;
          const Icon = item.icon;

          if (item.component) {
            const SheetComponent = item.component;
            return (
              <SheetComponent key={item.label}>
                <button className="relative flex flex-col items-center justify-center h-full text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{item.label}</span>
                  {item.label === 'Cart' && totalItems > 0 && (
                     <span className="absolute top-1 right-4 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                        {totalItems}
                    </span>
                  )}
                </button>
              </SheetComponent>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href || '#'}
              className={cn(
                'flex flex-col items-center justify-center h-full text-sm font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
