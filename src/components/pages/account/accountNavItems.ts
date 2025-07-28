
import {
    FileText,
    Shield,
    MapPin,
    Package,
    Headphones,
    RefreshCw,
    User,
  } from 'lucide-react';

export interface NavItem {
    icon: React.ElementType;
    label: string;
    href?: string;
    onClick?: () => void;
}
  
export const getLegalItems = (): NavItem[] => [
    { icon: FileText, label: 'Terms & Conditions', href: '/terms' },
    { icon: RefreshCw, label: 'Refund & Cancellation Policy', href: '/refund-policy' },
    { icon: Headphones, label: 'Help Center', href: '#' },
];
  
export const getGeneralItems = (): NavItem[] => [
    { icon: Package, label: 'My Orders', href: '/my-orders' },
    { icon: MapPin, label: 'Address Book', href: '#' },
];
  
export const getSecurityItems = (): NavItem[] => [
    { icon: User, label: 'Profile Details', href: '#' },
    { icon: Shield, label: 'Change Password', href: '#' },
];
