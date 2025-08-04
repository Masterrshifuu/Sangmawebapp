
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


export function BottomNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') { 
        if (window.scrollY > lastScrollY && window.scrollY > 100) { // Scrolling down
          setIsVisible(false);
        } else { // Scrolling up
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY); 
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);

      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);
  
  useEffect(() => {
    if (!user) {
      setActiveOrderCount(0);
      return;
    }

    const ordersRef = collection(db, 'orders');
    const q = query(
        ordersRef, 
        where('userId', '==', user.uid), 
        where('active', '==', true)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setActiveOrderCount(querySnapshot.size);
    });

    return () => unsubscribe();
  }, [user]);


  const hiddenPaths = ['/ai-chat', '/checkout', '/login', '/signup/phone'];
  if (hiddenPaths.some(path => pathname.startsWith(path))) {
    return null;
  }

  return (
    <nav className={cn(
        "fixed bottom-0 left-0 right-0 h-16 bg-background/70 backdrop-blur-sm border-t z-50 md:hidden transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)`}}>
        {navItems.map((item) => {
          const isActive = (item.isLink && item.href === '/') ? pathname === '/' : (item.isLink && pathname.startsWith(item.href || '---'));
          const Icon = item.icon;
          const showCartBadge = item.label === 'Cart' && totalItems > 0;
          const showTrackingBadge = item.label === 'Tracking' && activeOrderCount > 0;
          const badgeCount = item.label === 'Cart' ? totalItems : activeOrderCount;

          if (item.component) {
            const SheetComponent = item.component;
            return (
              <SheetComponent key={item.label}>
                <button className="relative flex flex-col items-center justify-center h-full text-sm font-medium text-muted-foreground hover:text-primary transition-all active:scale-95">
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{item.label}</span>
                  {(showCartBadge || showTrackingBadge) && (
                     <span className="absolute top-1 right-4 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                        {badgeCount}
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
