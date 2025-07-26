
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { navItems } from '@/lib/navigation';


export function BottomNavbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/70 backdrop-blur-sm border-t z-50 md:hidden">
      <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)`}}>
        {navItems.map((item) => {
          const isActive = (item.isLink && item.href === '/') ? pathname === '/' : (item.isLink && pathname.startsWith(item.href || '---'));
          const Icon = item.icon;

          if (item.component) {
            const SheetComponent = item.component;
            return (
              <SheetComponent key={item.label}>
                <button className="relative flex flex-col items-center justify-center h-full text-sm font-medium text-muted-foreground hover:text-primary transition-all active:scale-95">
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{item.label}</span>
                  {item.label === 'Cart' && totalItems > 0 && (
                     <span className="absolute top-1 right-4 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
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
                'flex flex-col items-center justify-center h-full text-sm font-medium transition-all active:scale-95',
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
