
'use client';

import { Home, LayoutGrid, Truck, Sparkles, ShoppingCart, User } from 'lucide-react';

import { AiChatSheet } from '@/components/AiChatSheet';
import { CartSheet } from '@/components/CartSheet';
import { TrackingSheet } from '@/components/TrackingSheet';
import { CategorySheet } from '@/components/CategorySheet';
import { AccountSheet } from '@/components/AccountSheet';

export const navItems = [
  { href: '/', label: 'Home', icon: Home, isLink: true },
  { label: 'Categories', icon: LayoutGrid, component: CategorySheet },
  { label: 'Tracking', icon: Truck, component: TrackingSheet },
  { label: 'AI Chat', icon: Sparkles, component: AiChatSheet },
  { label: 'Cart', icon: ShoppingCart, component: CartSheet },
  { label: 'Account', icon: User, component: AccountSheet },
];
