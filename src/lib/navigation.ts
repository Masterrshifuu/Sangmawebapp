
'use client';

import { Home, LayoutGrid, Truck, Sparkles, ShoppingCart, User } from 'lucide-react';

import { AiChatSheet } from '@/components/sheets/AiChatSheet';
import { CartSheet } from '@/components/sheets/CartSheet';
import { TrackingSheet } from '@/components/sheets/TrackingSheet';

export const navItems = [
  { href: '/', label: 'Home', icon: Home, isLink: true },
  { href: '/categories', label: 'Categories', icon: LayoutGrid, isLink: true },
  { label: 'Tracking', icon: Truck, component: TrackingSheet },
  { label: 'AI Chat', icon: Sparkles, component: AiChatSheet },
  { label: 'Cart', icon: ShoppingCart, component: CartSheet },
  { href: '/account', label: 'Account', icon: User, isLink: true },
];
