
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { navItems } from '@/lib/navigation';

export function DesktopNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <nav className="hidden md:flex justify-center items-center py-2">
      <div className="flex items-center gap-6">
        {navItems.map((item) => {
          const isActive = item.href === pathname;
          const Icon = item.icon;

          if (item.component) {
            const SheetComponent = item.component;
            return (
              <SheetComponent key={item.label}>
                <button className="relative flex flex-col items-center justify-center text-sm font-medium text-muted-foreground hover:text-primary transition-all active:scale-95">
                  <Icon className="w-6 h-6" />
                  <span className="sr-only">{item.label}</span>
                  {item.label === 'Cart' && totalItems > 0 && (
                     <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
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
                'flex flex-col items-center justify-center text-sm font-medium transition-all active:scale-95',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
