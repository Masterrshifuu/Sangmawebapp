
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { navItems } from '@/lib/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';

export function DesktopNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <nav className="hidden md:flex justify-center items-center py-2">
      <div className="flex items-center gap-6">
        {navItems.map((item) => {
          const isActive = (item.isLink && item.href === '/') ? pathname === '/' : (item.isLink && pathname.startsWith(item.href || '---'));
          const Icon = item.icon;

          // On desktop, if it's a link, render a Link. If it has a component, render a SheetTrigger.
          if (item.isLink && item.href) {
             // Special case for categories: on desktop, it's a link, not a sheet.
            if (item.label === 'Categories' && isDesktop) {
                 return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            'flex flex-col items-center justify-center text-sm font-medium transition-all active:scale-95',
                            isActive ? 'text-primary' : 'text-yellow-500 hover:text-primary'
                        )}
                    >
                        <Icon className="w-6 h-6 fill-current" />
                        <span className="sr-only">{item.label}</span>
                    </Link>
                );
            }
            if (item.label !== 'Categories') {
                 return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            'flex flex-col items-center justify-center text-sm font-medium transition-all active:scale-95',
                            isActive ? 'text-primary' : 'text-yellow-500 hover:text-primary'
                        )}
                    >
                        <Icon className="w-6 h-6 fill-current" />
                        <span className="sr-only">{item.label}</span>
                    </Link>
                );
            }
          }
          
          if (item.component) {
            const SheetComponent = item.component;
            return (
              <SheetComponent key={item.label}>
                <button className="relative flex flex-col items-center justify-center text-sm font-medium text-yellow-500 hover:text-primary transition-all active:scale-95">
                  <Icon className="w-6 h-6 fill-current" />
                  <span className="sr-only">{item.label}</span>
                  {item.label === 'Cart' && totalItems > 0 && (
                     <span className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                        {totalItems}
                    </span>
                  )}
                </button>
              </SheetComponent>
            );
          }

          return null;
        })}
      </div>
    </nav>
  );
}
