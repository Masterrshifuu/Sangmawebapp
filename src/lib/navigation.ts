
'use client';

import { Home, LayoutGrid, Truck, Sparkles, ShoppingCart, User } from 'lucide-react';

import { AiChatSheet } from '@/components/sheets/AiChatSheet';
import { CartSheet } from '@/components/sheets/CartSheet';
import { TrackingSheet } from '@/components/sheets/TrackingSheet';
import { CategorySheet } from '@/components/sheets/CategorySheet';
import { AccountSheet } from '@/components/sheets/AccountSheet';

export const navItems = [
  { href: '/', label: 'Home', icon: Home, isLink: true },
  { label: 'Categories', icon: LayoutGrid, component: CategorySheet },
  { label: 'Tracking', icon: Truck, component: TrackingSheet },
  { label: 'AI Chat', icon: Sparkles, component: AiChatSheet },
  { label: 'Cart', icon: ShoppingCart, component: CartSheet },
  { label: 'Account', icon: User, component: AccountSheet },
];
