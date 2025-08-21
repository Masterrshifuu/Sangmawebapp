
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { navItems } from '@/lib/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useHomeSheet } from '@/hooks/use-home-sheet'; // Import useHomeSheet

export function DesktopNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const { openSheet, setOpenSheet } = useHomeSheet(); // Use useHomeSheet
  const [unreadOrderCount, setUnreadOrderCount] = useState(0);

  useEffect(() => {
    if (!user) {
      return;
    }

    const ordersRef = collection(db, 'orders');
    const q = query(
        ordersRef, 
        where('userId', '==', user.uid), 
        where('active', '==', true)
    );
    
    const qUnread = query(
        ordersRef,
        where('userId', '==', user.uid),
        where('active', '==', true),
        where('viewedByCustomer', 'in', [false, null])
    );

    const unsubscribe = onSnapshot(qUnread, (snapshot) => {
        setUnreadOrderCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <nav className="hidden md:flex justify-center items-center py-2">
      <div className="flex items-center gap-6">
        {navItems.map((item) => {
          const isActive = (item.isLink && item.href === '/') ? pathname === '/' : (item.isLink && pathname.startsWith(item.href || '---'));
          const Icon = item.icon;
          const showCartBadge = item.label === 'Cart' && totalItems > 0;
          const showTrackingBadge = item.label === 'Tracking' && unreadOrderCount > 0;
          const badgeCount = item.label === 'Cart' ? totalItems : unreadOrderCount;

          if (item.isLink && item.href) {
            return (
                <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                        'flex flex-col items-center justify-center text-sm font-medium transition-all active:scale-95',
                        isActive ? 'text-accent-foreground' : 'text-muted-foreground hover:text-accent-foreground'
                    )}
                >
                    <Icon className="w-6 h-6" />
                    <span className="sr-only">{item.label}</span>
                </Link>
            );
          }
          
          if (item.component) {
            const SheetComponent = item.component;
            // Determine if this specific sheet should be open
            const isThisSheetOpen = openSheet === item.label;

            return (
              <SheetComponent 
                key={item.label} 
                open={isThisSheetOpen} 
                onOpenChange={(isOpen) => setOpenSheet(isOpen ? (item.label as 'Cart' | 'Tracking') : null)}
              >
                <button 
                  className="relative flex flex-col items-center justify-center text-sm font-medium text-muted-foreground hover:text-accent-foreground transition-all active:scale-95"
                  onClick={() => setOpenSheet(item.label as 'Cart' | 'Tracking')} // Set the specific sheet to open
                >
                  <Icon className="w-6 h-6" />
                  <span className="sr-only">{item.label}</span>
                  {(showCartBadge || showTrackingBadge) && (
                     <span className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                        {badgeCount}
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
