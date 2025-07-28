
import {
    FileText,
    Shield,
    MapPin,
    Package,
    Headphones,
    RefreshCw,
    User,
  } from 'lucide-react';
import { AddressBook } from './AddressBook';
import { ProfileDetailsForm } from './ProfileDetailsForm';
import { ChangePasswordForm } from './ChangePasswordForm';

export interface NavItem {
    icon: React.ElementType;
    label: string;
    href?: string;
    onClick?: () => void;
    content?: React.ReactNode;
}
  
export const getLegalItems = (): NavItem[] => [
    { icon: FileText, label: 'Terms & Conditions', href: '/terms' },
    { icon: RefreshCw, label: 'Refund & Cancellation Policy', href: '/refund-policy' },
    { icon: Headphones, label: 'Help Center', content: 'For help, please contact us at support@sangma.com' },
];
  
export const myOrdersItem: NavItem = { 
    icon: Package, 
    label: 'My Orders', 
    href: '/my-orders'
};

export const getGeneralItems = (): NavItem[] => [
    { icon: MapPin, label: 'Address Book', content: AddressBook },
];
  
export const getSecurityItems = (): NavItem[] => [
    { icon: User, label: 'Profile Details', content: ProfileDetailsForm },
    { icon: Shield, label: 'Change Password', content: ChangePasswordForm },
];
