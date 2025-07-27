
'use client';

import { Home, LayoutGrid, Truck, Sparkles, ShoppingCart, User } from 'lucide-react';

import { CartSheet } from '@/components/sheets/CartSheet';
import { TrackingSheet } from '@/components/sheets/TrackingSheet';

export const navItems = [
  { href: '/', label: 'Home', icon: Home, isLink: true },
  { href: '/categories', label: 'Categories', icon: LayoutGrid, isLink: true },
  { label: 'Tracking', icon: Truck, component: TrackingSheet },
  { href: '/ai-chat', label: 'AI Chat', icon: Sparkles, isLink: true },
  { label: 'Cart', icon: ShoppingCart, component: CartSheet },
  { href: '/account', label: 'Account', icon: User, isLink: true },
];
